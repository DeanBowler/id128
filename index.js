const { Ulid } = require('./src/id/ulid');
const { UlidMonotonic } = require('./src/id/ulid-monotonic');
const { Uuid } = require('./src/id/uuid');
const { Uuid1 } = require('./src/id/uuid-1');
const { Uuid4 } = require('./src/id/uuid-4');
const { Uuid6 } = require('./src/id/uuid-6');
const { UuidNil } = require('./src/id/uuid-nil');

const Crockford32Coder = require('./src/coder/crockford32');
const HexCoder = require('./src/coder/hex');
const UuidCoder = require('./src/coder/uuid');

const { IdFactory } = require('./src/factory/id');
const { VersionedIdFactory } = require('./src/factory/versioned-id');
const Exception = require('./src/common/exception');

const namespace = {
	idCompare: function(lhs, rhs) { return lhs.compare(rhs); },
	idEqual: function(lhs, rhs) { return lhs.equal(rhs); },
	Exception,
	Ulid: new IdFactory({
		id: Ulid,
		canonical_coder: Crockford32Coder,
		raw_coder: HexCoder,
	}),
	UlidMonotonic: new IdFactory({
		id: UlidMonotonic,
		canonical_coder: Crockford32Coder,
		raw_coder: HexCoder,
	}),
	Uuid: new VersionedIdFactory({
		abstract_id: Uuid,
		versioned_ids: [
			Uuid1,
			Uuid4,
			Uuid6,
			UuidNil,
		],
		canonical_coder: UuidCoder,
		raw_coder: HexCoder,
	}),
	Uuid4: new VersionedIdFactory({
		abstract_id: Uuid4,
		versioned_ids: [
			Uuid4,
		],
		canonical_coder: UuidCoder,
		raw_coder: HexCoder,
	}),
};

module.exports = namespace;
