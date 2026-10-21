exports.serializeGroup = (group) => group;

exports.serializeGroups = (groups) => groups.map(exports.serializeGroup);
