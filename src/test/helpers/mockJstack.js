var JSTACK = {};
JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants"]);
JSTACK.Nova = jasmine.createSpyObj("Nova", ["getimagelist"]);
