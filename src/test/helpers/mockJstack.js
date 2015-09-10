var JSTACK = {
	Keystone: jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params"]),
	Nova: jasmine.createSpyObj("Nova", ["getimagelist", "createimage", "createserver", "getflavorlist"]),
    Neutron: jasmine.createSpyObj("Neutron", ["getnetworkslist"])
};