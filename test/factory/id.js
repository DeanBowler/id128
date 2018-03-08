'use strict';

const { expect } = require('chai');

const { IdFactory: described_class } = require('factory/id');

const id_class = class {
	static generate() { return new this(`id_${Date.now()}`) }
	static MIN() { return new this('\x00') }
	static MAX() { return new this('\xFF') }
	constructor(value) { this._bytes = value }
	get bytes() { return this._bytes }
};

const factory = new described_class({
	id: id_class,
	canonical_coder: {
		encode: (bytes) => `canonical ${bytes}`,
		encodeTrusted: (bytes) => `canonical ${bytes}`,
		decode: (str) => str.replace(/^canonical(?:_distrusted)? /, ''),
		decodeTrusted: (str) => str.replace(/^canonical /, ''),
	},
	raw_coder: {
		encode: (bytes) => `raw ${bytes}`,
		encodeTrusted: (bytes) => `raw ${bytes}`,
		decode: (str) => str.replace(/^raw(?:_distrusted)? /, ''),
		decodeTrusted: (str) => str.replace(/^raw /, ''),
	},
});


function assertDecoder(method, encoding) {
	describe(`#${method}`, function() {
		const subject = () => factory[method](encoding);

		it('returns an id', function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		assertInjectsInstanceMethod('toCanonical', subject);
		assertInjectsInstanceMethod('toRaw', subject);
	});
}

function assertEncoder(method, pattern) {
	describe(`#${method}`, function() {
		const subject = () => factory[method](factory.generate());

		it('encodes the bytes of the id', function() {
			expect(subject()).to.match(pattern);
		});
	});
}

function assertGenerator(method) {
	describe(`#${method}`, function() {
		const subject = () => factory[method]();

		it(`returns an id`, function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		it('always returns a different object', function() {
			expect(subject()).not.to.equal(subject());
		});

		assertInjectsInstanceMethod('toCanonical', subject);
		assertInjectsInstanceMethod('toRaw', subject);
	});
}

function assertInjectsInstanceMethod(injected_method, generator) {
	describe(injected_method, function() {
		it(`is injected into the instance`, function() {
			const id = generator();

			expect(() => id[injected_method]()).not.to.throw();
			expect(id[injected_method]()).to.equal(factory[injected_method](id));
		});

		it('is only injected into the instance', function() {
			const id = generator();

			expect(new id_class()[injected_method]).to.be.undefined;
		});
	});
}


describe(described_class.name, function() {
	describe('#construct', function() {
		const subject = () => factory.construct('some bytes');

		it('returns an id', function() {
			expect(subject()).to.be.an.instanceof(id_class);
		});

		it('directly stores the bytes', function() {
			expect(subject()).to.have.property('bytes', 'some bytes');
		});
	});

	describe('#name', function() {
		const subject = () => factory.name;

		it('returns the name of the id generated by the factory', function() {
			expect(subject()).to.equal(id_class.name);
		});
	});

	assertGenerator('generate');
	assertGenerator('MIN');
	assertGenerator('MAX');

	assertDecoder('fromCanonical', 'canonical_distrusted some_id');
	assertDecoder('fromCanonicalTrusted', 'canonical some_id');
	assertDecoder('fromRaw', 'raw_distrusted some_id');
	assertDecoder('fromRawTrusted', 'raw some_id');

	assertEncoder('toCanonical', /^canonical id_\d+$/);
	assertEncoder('toRaw', /^raw id_\d+$/);
});

