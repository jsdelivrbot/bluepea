"use strict";
// Transcrypt'ed from Python, 2017-10-04 23:46:25
function tests () {
   var __symbols__ = ['__py3.6__', '__esv5__'];
    var __all__ = {};
    var __world__ = __all__;
    
    // Nested object creator, part of the nesting may already exist and have attributes
    var __nest__ = function (headObject, tailNames, value) {
        // In some cases this will be a global object, e.g. 'window'
        var current = headObject;
        
        if (tailNames != '') {  // Split on empty string doesn't give empty list
            // Find the last already created object in tailNames
            var tailChain = tailNames.split ('.');
            var firstNewIndex = tailChain.length;
            for (var index = 0; index < tailChain.length; index++) {
                if (!current.hasOwnProperty (tailChain [index])) {
                    firstNewIndex = index;
                    break;
                }
                current = current [tailChain [index]];
            }
            
            // Create the rest of the objects, if any
            for (var index = firstNewIndex; index < tailChain.length; index++) {
                current [tailChain [index]] = {};
                current = current [tailChain [index]];
            }
        }
        
        // Insert it new attributes, it may have been created earlier and have other attributes
        for (var attrib in value) {
            current [attrib] = value [attrib];          
        }       
    };
    __all__.__nest__ = __nest__;
    
    // Initialize module if not yet done and return its globals
    var __init__ = function (module) {
        if (!module.__inited__) {
            module.__all__.__init__ (module.__all__);
            module.__inited__ = true;
        }
        return module.__all__;
    };
    __all__.__init__ = __init__;
    
    
    
    
    // Since we want to assign functions, a = b.f should make b.f produce a bound function
    // So __get__ should be called by a property rather then a function
    // Factory __get__ creates one of three curried functions for func
    // Which one is produced depends on what's to the left of the dot of the corresponding JavaScript property
    var __get__ = function (self, func, quotedFuncName) {
        if (self) {
            if (self.hasOwnProperty ('__class__') || typeof self == 'string' || self instanceof String) {           // Object before the dot
                if (quotedFuncName) {                                   // Memoize call since fcall is on, by installing bound function in instance
                    Object.defineProperty (self, quotedFuncName, {      // Will override the non-own property, next time it will be called directly
                        value: function () {                            // So next time just call curry function that calls function
                            var args = [] .slice.apply (arguments);
                            return func.apply (null, [self] .concat (args));
                        },              
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
                return function () {                                    // Return bound function, code dupplication for efficiency if no memoizing
                    var args = [] .slice.apply (arguments);             // So multilayer search prototype, apply __get__, call curry func that calls func
                    return func.apply (null, [self] .concat (args));
                };
            }
            else {                                                      // Class before the dot
                return func;                                            // Return static method
            }
        }
        else {                                                          // Nothing before the dot
            return func;                                                // Return free function
        }
    }
    __all__.__get__ = __get__;
        
    // Mother of all metaclasses        
    var py_metatype = {
        __name__: 'type',
        __bases__: [],
        
        // Overridable class creation worker
        __new__: function (meta, name, bases, attribs) {
            // Create the class cls, a functor, which the class creator function will return
            var cls = function () {                     // If cls is called with arg0, arg1, etc, it calls its __new__ method with [arg0, arg1, etc]
                var args = [] .slice.apply (arguments); // It has a __new__ method, not yet but at call time, since it is copied from the parent in the loop below
                return cls.__new__ (args);              // Each Python class directly or indirectly derives from object, which has the __new__ method
            };                                          // If there are no bases in the Python source, the compiler generates [object] for this parameter
            
            // Copy all methods, including __new__, properties and static attributes from base classes to new cls object
            // The new class object will simply be the prototype of its instances
            // JavaScript prototypical single inheritance will do here, since any object has only one class
            // This has nothing to do with Python multiple inheritance, that is implemented explictly in the copy loop below
            for (var index = bases.length - 1; index >= 0; index--) {   // Reversed order, since class vars of first base should win
                var base = bases [index];
                for (var attrib in base) {
                    var descrip = Object.getOwnPropertyDescriptor (base, attrib);
                    Object.defineProperty (cls, attrib, descrip);
                }           
            }
            
            // Add class specific attributes to the created cls object
            cls.__metaclass__ = meta;
            cls.__name__ = name;
            cls.__bases__ = bases;
            
            // Add own methods, properties and own static attributes to the created cls object
            for (var attrib in attribs) {
                var descrip = Object.getOwnPropertyDescriptor (attribs, attrib);
                Object.defineProperty (cls, attrib, descrip);
            }
            // Return created cls object
            return cls;
        }
    };
    py_metatype.__metaclass__ = py_metatype;
    __all__.py_metatype = py_metatype;
    
    // Mother of all classes
    var object = {
        __init__: function (self) {},
        
        __metaclass__: py_metatype, // By default, all classes have metaclass type, since they derive from object
        __name__: 'object',
        __bases__: [],
            
        // Object creator function, is inherited by all classes (so could be global)
        __new__: function (args) {  // Args are just the constructor args       
            // In JavaScript the Python class is the prototype of the Python object
            // In this way methods and static attributes will be available both with a class and an object before the dot
            // The descriptor produced by __get__ will return the right method flavor
            var instance = Object.create (this, {__class__: {value: this, enumerable: true}});
            

            // Call constructor
            this.__init__.apply (null, [instance] .concat (args));

            // Return constructed instance
            return instance;
        }   
    };
    __all__.object = object;
    
    // Class creator facade function, calls class creation worker
    var __class__ = function (name, bases, attribs, meta) {         // Parameter meta is optional
        if (meta == undefined) {
            meta = bases [0] .__metaclass__;
        }
                
        return meta.__new__ (meta, name, bases, attribs);
    }
    __all__.__class__ = __class__;
    
    // Define __pragma__ to preserve '<all>' and '</all>', since it's never generated as a function, must be done early, so here
    var __pragma__ = function () {};
    __all__.__pragma__ = __pragma__;
    
    	__nest__ (
		__all__,
		'org.transcrypt.__base__', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var __Envir__ = __class__ ('__Envir__', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.interpreter_name = 'python';
							self.transpiler_name = 'transcrypt';
							self.transpiler_version = '3.6.49';
							self.target_subdir = '__javascript__';
						});}
					});
					var __envir__ = __Envir__ ();
					__pragma__ ('<all>')
						__all__.__Envir__ = __Envir__;
						__all__.__envir__ = __envir__;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'org.transcrypt.__standard__', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var Exception = __class__ ('Exception', [object], {
						get __init__ () {return __get__ (this, function (self) {
							var kwargs = dict ();
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											default: kwargs [__attrib0__] = __allkwargs0__ [__attrib0__];
										}
									}
									delete kwargs.__kwargtrans__;
								}
								var args = tuple ([].slice.apply (arguments).slice (1, __ilastarg0__ + 1));
							}
							else {
								var args = tuple ();
							}
							self.__args__ = args;
							try {
								self.stack = kwargs.error.stack;
							}
							catch (__except0__) {
								self.stack = 'No stack trace available';
							}
						});},
						get __repr__ () {return __get__ (this, function (self) {
							if (len (self.__args__)) {
								return '{}{}'.format (self.__class__.__name__, repr (tuple (self.__args__)));
							}
							else {
								return '{}()'.format (self.__class__.__name__);
							}
						});},
						get __str__ () {return __get__ (this, function (self) {
							if (len (self.__args__) > 1) {
								return str (tuple (self.__args__));
							}
							else if (len (self.__args__)) {
								return str (self.__args__ [0]);
							}
							else {
								return '';
							}
						});}
					});
					var IterableError = __class__ ('IterableError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, "Can't iterate over non-iterable", __kwargtrans__ ({error: error}));
						});}
					});
					var StopIteration = __class__ ('StopIteration', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Iterator exhausted', __kwargtrans__ ({error: error}));
						});}
					});
					var ValueError = __class__ ('ValueError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Erroneous value', __kwargtrans__ ({error: error}));
						});}
					});
					var KeyError = __class__ ('KeyError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Invalid key', __kwargtrans__ ({error: error}));
						});}
					});
					var AssertionError = __class__ ('AssertionError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							if (message) {
								Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
							}
							else {
								Exception.__init__ (self, __kwargtrans__ ({error: error}));
							}
						});}
					});
					var NotImplementedError = __class__ ('NotImplementedError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var IndexError = __class__ ('IndexError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var AttributeError = __class__ ('AttributeError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var Warning = __class__ ('Warning', [Exception], {
					});
					var UserWarning = __class__ ('UserWarning', [Warning], {
					});
					var DeprecationWarning = __class__ ('DeprecationWarning', [Warning], {
					});
					var RuntimeWarning = __class__ ('RuntimeWarning', [Warning], {
					});
					var __sort__ = function (iterable, key, reverse) {
						if (typeof key == 'undefined' || (key != null && key .hasOwnProperty ("__kwargtrans__"))) {;
							var key = null;
						};
						if (typeof reverse == 'undefined' || (reverse != null && reverse .hasOwnProperty ("__kwargtrans__"))) {;
							var reverse = false;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'iterable': var iterable = __allkwargs0__ [__attrib0__]; break;
										case 'key': var key = __allkwargs0__ [__attrib0__]; break;
										case 'reverse': var reverse = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (key) {
							iterable.sort ((function __lambda__ (a, b) {
								if (arguments.length) {
									var __ilastarg0__ = arguments.length - 1;
									if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
										var __allkwargs0__ = arguments [__ilastarg0__--];
										for (var __attrib0__ in __allkwargs0__) {
											switch (__attrib0__) {
												case 'a': var a = __allkwargs0__ [__attrib0__]; break;
												case 'b': var b = __allkwargs0__ [__attrib0__]; break;
											}
										}
									}
								}
								else {
								}
								return (key (a) > key (b) ? 1 : -(1));
							}));
						}
						else {
							iterable.sort ();
						}
						if (reverse) {
							iterable.reverse ();
						}
					};
					var sorted = function (iterable, key, reverse) {
						if (typeof key == 'undefined' || (key != null && key .hasOwnProperty ("__kwargtrans__"))) {;
							var key = null;
						};
						if (typeof reverse == 'undefined' || (reverse != null && reverse .hasOwnProperty ("__kwargtrans__"))) {;
							var reverse = false;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'iterable': var iterable = __allkwargs0__ [__attrib0__]; break;
										case 'key': var key = __allkwargs0__ [__attrib0__]; break;
										case 'reverse': var reverse = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (py_typeof (iterable) == dict) {
							var result = copy (iterable.py_keys ());
						}
						else {
							var result = copy (iterable);
						}
						__sort__ (result, key, reverse);
						return result;
					};
					var map = function (func, iterable) {
						return function () {
							var __accu0__ = [];
							var __iterable0__ = iterable;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var item = __iterable0__ [__index0__];
								__accu0__.append (func (item));
							}
							return __accu0__;
						} ();
					};
					var filter = function (func, iterable) {
						if (func == null) {
							var func = bool;
						}
						return function () {
							var __accu0__ = [];
							var __iterable0__ = iterable;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var item = __iterable0__ [__index0__];
								if (func (item)) {
									__accu0__.append (item);
								}
							}
							return __accu0__;
						} ();
					};
					var __Terminal__ = __class__ ('__Terminal__', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.buffer = '';
							try {
								self.element = document.getElementById ('__terminal__');
							}
							catch (__except0__) {
								self.element = null;
							}
							if (self.element) {
								self.element.style.overflowX = 'auto';
								self.element.style.boxSizing = 'border-box';
								self.element.style.padding = '5px';
								self.element.innerHTML = '_';
							}
						});},
						get print () {return __get__ (this, function (self) {
							var sep = ' ';
							var end = '\n';
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'sep': var sep = __allkwargs0__ [__attrib0__]; break;
											case 'end': var end = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
								var args = tuple ([].slice.apply (arguments).slice (1, __ilastarg0__ + 1));
							}
							else {
								var args = tuple ();
							}
							self.buffer = '{}{}{}'.format (self.buffer, sep.join (function () {
								var __accu0__ = [];
								var __iterable0__ = args;
								for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
									var arg = __iterable0__ [__index0__];
									__accu0__.append (str (arg));
								}
								return __accu0__;
							} ()), end).__getslice__ (-(4096), null, 1);
							if (self.element) {
								self.element.innerHTML = self.buffer.py_replace ('\n', '<br>');
								self.element.scrollTop = self.element.scrollHeight;
							}
							else {
								console.log (sep.join (function () {
									var __accu0__ = [];
									var __iterable0__ = args;
									for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
										var arg = __iterable0__ [__index0__];
										__accu0__.append (str (arg));
									}
									return __accu0__;
								} ()));
							}
						});},
						get input () {return __get__ (this, function (self, question) {
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'question': var question = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
							}
							else {
							}
							self.print ('{}'.format (question), __kwargtrans__ ({end: ''}));
							var answer = window.prompt ('\n'.join (self.buffer.py_split ('\n').__getslice__ (-(16), null, 1)));
							self.print (answer);
							return answer;
						});}
					});
					var __terminal__ = __Terminal__ ();
					__pragma__ ('<all>')
						__all__.AssertionError = AssertionError;
						__all__.AttributeError = AttributeError;
						__all__.DeprecationWarning = DeprecationWarning;
						__all__.Exception = Exception;
						__all__.IndexError = IndexError;
						__all__.IterableError = IterableError;
						__all__.KeyError = KeyError;
						__all__.NotImplementedError = NotImplementedError;
						__all__.RuntimeWarning = RuntimeWarning;
						__all__.StopIteration = StopIteration;
						__all__.UserWarning = UserWarning;
						__all__.ValueError = ValueError;
						__all__.Warning = Warning;
						__all__.__Terminal__ = __Terminal__;
						__all__.__sort__ = __sort__;
						__all__.__terminal__ = __terminal__;
						__all__.filter = filter;
						__all__.map = map;
						__all__.sorted = sorted;
					__pragma__ ('</all>')
				}
			}
		}
	);
    var __call__ = function (/* <callee>, <this>, <params>* */) {   // Needed for __base__ and __standard__ if global 'opov' switch is on
        var args = [] .slice.apply (arguments);
        if (typeof args [0] == 'object' && '__call__' in args [0]) {        // Overloaded
            return args [0] .__call__ .apply (args [1], args.slice (2));
        }
        else {                                                              // Native
            return args [0] .apply (args [1], args.slice (2));
        }
    };
    __all__.__call__ = __call__;

    // Initialize non-nested modules __base__ and __standard__ and make its names available directly and via __all__
    // They can't do that itself, because they're regular Python modules
    // The compiler recognizes their names and generates them inline rather than nesting them
    // In this way it isn't needed to import them everywhere

    // __base__

    __nest__ (__all__, '', __init__ (__all__.org.transcrypt.__base__));
    var __envir__ = __all__.__envir__;

    // __standard__

    __nest__ (__all__, '', __init__ (__all__.org.transcrypt.__standard__));

    var Exception = __all__.Exception;
    var IterableError = __all__.IterableError;
    var StopIteration = __all__.StopIteration;
    var ValueError = __all__.ValueError;
    var KeyError = __all__.KeyError;
    var AssertionError = __all__.AssertionError;
    var NotImplementedError = __all__.NotImplementedError;
    var IndexError = __all__.IndexError;
    var AttributeError = __all__.AttributeError;

    // Warnings Exceptions
    var Warning = __all__.Warning;
    var UserWarning = __all__.UserWarning;
    var DeprecationWarning = __all__.DeprecationWarning;
    var RuntimeWarning = __all__.RuntimeWarning;

    var __sort__ = __all__.__sort__;
    var sorted = __all__.sorted;

    var map = __all__.map;
    var filter = __all__.filter;

    __all__.print = __all__.__terminal__.print;
    __all__.input = __all__.__terminal__.input;

    var __terminal__ = __all__.__terminal__;
    var print = __all__.print;
    var input = __all__.input;

    // Complete __envir__, that was created in __base__, for non-stub mode
    __envir__.executor_name = __envir__.transpiler_name;

    // Make make __main__ available in browser
    var __main__ = {__file__: ''};
    __all__.main = __main__;

    // Define current exception, there's at most one exception in the air at any time
    var __except__ = null;
    __all__.__except__ = __except__;
    
     // Creator of a marked dictionary, used to pass **kwargs parameter
    var __kwargtrans__ = function (anObject) {
        anObject.__kwargtrans__ = null; // Removable marker
        anObject.constructor = Object;
        return anObject;
    }
    __all__.__kwargtrans__ = __kwargtrans__;

    // 'Oneshot' dict promotor, used to enrich __all__ and help globals () return a true dict
    var __globals__ = function (anObject) {
        if (isinstance (anObject, dict)) {  // Don't attempt to promote (enrich) again, since it will make a copy
            return anObject;
        }
        else {
            return dict (anObject)
        }
    }
    __all__.__globals__ = __globals__
    
    // Partial implementation of super () .<methodName> (<params>)
    var __super__ = function (aClass, methodName) {
        // Lean and fast, no C3 linearization, only call first implementation encountered
        // Will allow __super__ ('<methodName>') (self, <params>) rather than only <className>.<methodName> (self, <params>)
        
        for (var index = 0; index < aClass.__bases__.length; index++) {
            var base = aClass.__bases__ [index];
            if (methodName in base) {
               return base [methodName];
            }
        }

        throw new Exception ('Superclass method not found');    // !!! Improve!
    }
    __all__.__super__ = __super__
        
    // Python property installer function, no member since that would bloat classes
    var property = function (getter, setter) {  // Returns a property descriptor rather than a property
        if (!setter) {  // ??? Make setter optional instead of dummy?
            setter = function () {};
        }
        return {get: function () {return getter (this)}, set: function (value) {setter (this, value)}, enumerable: true};
    }
    __all__.property = property;
    
    // Conditional JavaScript property installer function, prevents redefinition of properties if multiple Transcrypt apps are on one page
    var __setProperty__ = function (anObject, name, descriptor) {
        if (!anObject.hasOwnProperty (name)) {
            Object.defineProperty (anObject, name, descriptor);
        }
    }
    __all__.__setProperty__ = __setProperty__
    
    // Assert function, call to it only generated when compiling with --dassert option
    function assert (condition, message) {  // Message may be undefined
        if (!condition) {
            throw AssertionError (message, new Error ());
        }
    }

    __all__.assert = assert;

    var __merge__ = function (object0, object1) {
        var result = {};
        for (var attrib in object0) {
            result [attrib] = object0 [attrib];
        }
        for (var attrib in object1) {
            result [attrib] = object1 [attrib];
        }
        return result;
    };
    __all__.__merge__ = __merge__;

    // Manipulating attributes by name
    
    var dir = function (obj) {
        var aList = [];
        for (var aKey in obj) {
            aList.push (aKey);
        }
        aList.sort ();
        return aList;
    };
    __all__.dir = dir;

    var setattr = function (obj, name, value) {
        obj [name] = value;
    };
    __all__.setattr = setattr;

    var getattr = function (obj, name) {
        return obj [name];
    };
    __all__.getattr= getattr;

    var hasattr = function (obj, name) {
        try {
            return name in obj;
        }
        catch (exception) {
            return false;
        }
    };
    __all__.hasattr = hasattr;

    var delattr = function (obj, name) {
        delete obj [name];
    };
    __all__.delattr = (delattr);

    // The __in__ function, used to mimic Python's 'in' operator
    // In addition to CPython's semantics, the 'in' operator is also allowed to work on objects, avoiding a counterintuitive separation between Python dicts and JavaScript objects
    // In general many Transcrypt compound types feature a deliberate blend of Python and JavaScript facilities, facilitating efficient integration with JavaScript libraries
    // If only Python objects and Python dicts are dealt with in a certain context, the more pythonic 'hasattr' is preferred for the objects as opposed to 'in' for the dicts
    var __in__ = function (element, container) {
        if (py_typeof (container) == dict) {        // Currently only implemented as an augmented JavaScript object
            return container.hasOwnProperty (element);
        }
        else {                                      // Parameter 'element' itself is an array, string or a plain, non-dict JavaScript object
            return (
                container.indexOf ?                 // If it has an indexOf
                container.indexOf (element) > -1 :  // it's an array or a string,
                container.hasOwnProperty (element)  // else it's a plain, non-dict JavaScript object
            );
        }
    };
    __all__.__in__ = __in__;

    // Find out if an attribute is special
    var __specialattrib__ = function (attrib) {
        return (attrib.startswith ('__') && attrib.endswith ('__')) || attrib == 'constructor' || attrib.startswith ('py_');
    };
    __all__.__specialattrib__ = __specialattrib__;

    // Compute length of any object
    var len = function (anObject) {
        if (anObject === undefined || anObject === null) {
            return 0;
        }

        if (anObject.__len__ instanceof Function) {
            return anObject.__len__ ();
        }

        if (anObject.length !== undefined) {
            return anObject.length;
        }

        var length = 0;
        for (var attr in anObject) {
            if (!__specialattrib__ (attr)) {
                length++;
            }
        }

        return length;
    };
    __all__.len = len;

    // General conversions

    function __i__ (any) {  //  Conversion to iterable
        return py_typeof (any) == dict ? any.py_keys () : any;
    }

    // If the target object is somewhat true, return it. Otherwise return false.
    // Try to follow Python conventions of truthyness
    function __t__ (target) { 
        return (
            // Avoid invalid checks
            target === undefined || target === null ? false :
            
            // Take a quick shortcut if target is a simple type
            ['boolean', 'number'] .indexOf (typeof target) >= 0 ? target :
            
            // Use __bool__ (if present) to decide if target is true
            target.__bool__ instanceof Function ? (target.__bool__ () ? target : false) :
            
            // There is no __bool__, use __len__ (if present) instead
            target.__len__ instanceof Function ?  (target.__len__ () !== 0 ? target : false) :
            
            // There is no __bool__ and no __len__, declare Functions true.
            // Python objects are transpiled into instances of Function and if
            // there is no __bool__ or __len__, the object in Python is true.
            target instanceof Function ? target :
            
            // Target is something else, compute its len to decide
            len (target) !== 0 ? target :
            
            // When all else fails, declare target as false
            false
        );
    }
    __all__.__t__ = __t__;

    var bool = function (any) {     // Always truly returns a bool, rather than something truthy or falsy
        return !!__t__ (any);
    };
    bool.__name__ = 'bool';         // So it can be used as a type with a name
    __all__.bool = bool;

    var float = function (any) {
        if (any == 'inf') {
            return Infinity;
        }
        else if (any == '-inf') {
            return -Infinity;
        }
        else if (isNaN (parseFloat (any))) {    // Call to parseFloat needed to exclude '', ' ' etc.
            throw ValueError (new Error ());
        }
        else {
            return +any;
        }
    };
    float.__name__ = 'float';
    __all__.float = float;

    var int = function (any) {
        return float (any) | 0
    };
    int.__name__ = 'int';
    __all__.int = int;

    var py_typeof = function (anObject) {
        var aType = typeof anObject;
        if (aType == 'object') {    // Directly trying '__class__ in anObject' turns out to wreck anObject in Chrome if its a primitive
            try {
                return anObject.__class__;
            }
            catch (exception) {
                return aType;
            }
        }
        else {
            return (    // Odly, the braces are required here
                aType == 'boolean' ? bool :
                aType == 'string' ? str :
                aType == 'number' ? (anObject % 1 == 0 ? int : float) :
                null
            );
        }
    };
    __all__.py_typeof = py_typeof;

    var isinstance = function (anObject, classinfo) {
        function isA (queryClass) {
            if (queryClass == classinfo) {
                return true;
            }
            for (var index = 0; index < queryClass.__bases__.length; index++) {
                if (isA (queryClass.__bases__ [index], classinfo)) {
                    return true;
                }
            }
            return false;
        }

        if (classinfo instanceof Array) {   // Assume in most cases it isn't, then making it recursive rather than two functions saves a call
            for (var index = 0; index < classinfo.length; index++) {
                var aClass = classinfo [index];
                if (isinstance (anObject, aClass)) {
                    return true;
                }
            }
            return false;
        }

        try {                   // Most frequent use case first
            return '__class__' in anObject ? isA (anObject.__class__) : anObject instanceof classinfo;
        }
        catch (exception) {     // Using isinstance on primitives assumed rare
            var aType = py_typeof (anObject);
            return aType == classinfo || (aType == bool && classinfo == int);
        }
    };
    __all__.isinstance = isinstance;

    var callable = function (anObject) {
        if ( typeof anObject == 'object' && '__call__' in anObject ) {
            return true;
        }
        else {
            return typeof anObject === 'function';
        }
    };
    __all__.callable = callable;

    // Repr function uses __repr__ method, then __str__, then toString
    var repr = function (anObject) {
        try {
            return anObject.__repr__ ();
        }
        catch (exception) {
            try {
                return anObject.__str__ ();
            }
            catch (exception) { // anObject has no __repr__ and no __str__
                try {
                    if (anObject == null) {
                        return 'None';
                    }
                    else if (anObject.constructor == Object) {
                        var result = '{';
                        var comma = false;
                        for (var attrib in anObject) {
                            if (!__specialattrib__ (attrib)) {
                                if (attrib.isnumeric ()) {
                                    var attribRepr = attrib;                // If key can be interpreted as numerical, we make it numerical
                                }                                           // So we accept that '1' is misrepresented as 1
                                else {
                                    var attribRepr = '\'' + attrib + '\'';  // Alpha key in dict
                                }

                                if (comma) {
                                    result += ', ';
                                }
                                else {
                                    comma = true;
                                }
                                result += attribRepr + ': ' + repr (anObject [attrib]);
                            }
                        }
                        result += '}';
                        return result;
                    }
                    else {
                        return typeof anObject == 'boolean' ? anObject.toString () .capitalize () : anObject.toString ();
                    }
                }
                catch (exception) {
                    return '<object of type: ' + typeof anObject + '>';
                }
            }
        }
    };
    __all__.repr = repr;

    // Char from Unicode or ASCII
    var chr = function (charCode) {
        return String.fromCharCode (charCode);
    };
    __all__.chr = chr;

    // Unicode or ASCII from char
    var ord = function (aChar) {
        return aChar.charCodeAt (0);
    };
    __all__.ord = ord;

    // Maximum of n numbers
    var max = Math.max;
    __all__.max = max;

    // Minimum of n numbers
    var min = Math.min;
    __all__.min = min;

    // Absolute value
    var abs = Math.abs;
    __all__.abs = abs;

    // Bankers rounding
    var round = function (number, ndigits) {
        if (ndigits) {
            var scale = Math.pow (10, ndigits);
            number *= scale;
        }

        var rounded = Math.round (number);
        if (rounded - number == 0.5 && rounded % 2) {   // Has rounded up to odd, should have rounded down to even
            rounded -= 1;
        }

        if (ndigits) {
            rounded /= scale;
        }

        return rounded;
    };
    __all__.round = round;

    // BEGIN unified iterator model

    function __jsUsePyNext__ () {       // Add as 'next' method to make Python iterator JavaScript compatible
        try {
            var result = this.__next__ ();
            return {value: result, done: false};
        }
        catch (exception) {
            return {value: undefined, done: true};
        }
    }

    function __pyUseJsNext__ () {       // Add as '__next__' method to make JavaScript iterator Python compatible
        var result = this.next ();
        if (result.done) {
            throw StopIteration (new Error ());
        }
        else {
            return result.value;
        }
    }

    function py_iter (iterable) {                   // Alias for Python's iter function, produces a universal iterator / iterable, usable in Python and JavaScript
        if (typeof iterable == 'string' || '__iter__' in iterable) {    // JavaScript Array or string or Python iterable (string has no 'in')
            var result = iterable.__iter__ ();                          // Iterator has a __next__
            result.next = __jsUsePyNext__;                              // Give it a next
        }
        else if ('selector' in iterable) {                              // Assume it's a JQuery iterator
            var result = list (iterable) .__iter__ ();                  // Has a __next__
            result.next = __jsUsePyNext__;                              // Give it a next
        }
        else if ('next' in iterable) {                                  // It's a JavaScript iterator already,  maybe a generator, has a next and may have a __next__
            var result = iterable
            if (! ('__next__' in result)) {                             // If there's no danger of recursion
                result.__next__ = __pyUseJsNext__;                      // Give it a __next__
            }
        }
        else if (Symbol.iterator in iterable) {                         // It's a JavaScript iterable such as a typed array, but not an iterator
            var result = iterable [Symbol.iterator] ();                 // Has a next
            result.__next__ = __pyUseJsNext__;                          // Give it a __next__
        }
        else {
            throw IterableError (new Error ()); // No iterator at all
        }
        result [Symbol.iterator] = function () {return result;};
        return result;
    }

    function py_next (iterator) {               // Called only in a Python context, could receive Python or JavaScript iterator
        try {                                   // Primarily assume Python iterator, for max speed
            var result = iterator.__next__ ();
        }
        catch (exception) {                     // JavaScript iterators are the exception here
            var result = iterator.next ();
            if (result.done) {
                throw StopIteration (new Error ());
            }
            else {
                return result.value;
            }
        }
        if (result == undefined) {
            throw StopIteration (new Error ());
        }
        else {
            return result;
        }
    }

    function __PyIterator__ (iterable) {
        this.iterable = iterable;
        this.index = 0;
    }

    __PyIterator__.prototype.__next__ = function () {
        if (this.index < this.iterable.length) {
            return this.iterable [this.index++];
        }
        else {
            throw StopIteration (new Error ());
        }
    };

    function __JsIterator__ (iterable) {
        this.iterable = iterable;
        this.index = 0;
    }

    __JsIterator__.prototype.next = function () {
        if (this.index < this.iterable.py_keys.length) {
            return {value: this.index++, done: false};
        }
        else {
            return {value: undefined, done: true};
        }
    };

    // END unified iterator model

    // Reversed function for arrays
    var py_reversed = function (iterable) {
        iterable = iterable.slice ();
        iterable.reverse ();
        return iterable;
    };
    __all__.py_reversed = py_reversed;

    // Zip method for arrays and strings
    var zip = function () {
        var args = [] .slice.call (arguments);
        for (var i = 0; i < args.length; i++) {
            if (typeof args [i] == 'string') {
                args [i] = args [i] .split ('');
            }
            else if (!Array.isArray (args [i])) {
                args [i] = Array.from (args [i]);
            }
        }
        var shortest = args.length == 0 ? [] : args.reduce (    // Find shortest array in arguments
            function (array0, array1) {
                return array0.length < array1.length ? array0 : array1;
            }
        );
        return shortest.map (                   // Map each element of shortest array
            function (current, index) {         // To the result of this function
                return args.map (               // Map each array in arguments
                    function (current) {        // To the result of this function
                        return current [index]; // Namely it's index't entry
                    }
                );
            }
        );
    };
    __all__.zip = zip;

    // Range method, returning an array
    function range (start, stop, step) {
        if (stop == undefined) {
            // one param defined
            stop = start;
            start = 0;
        }
        if (step == undefined) {
            step = 1;
        }
        if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
            return [];
        }
        var result = [];
        for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
            result.push(i);
        }
        return result;
    };
    __all__.range = range;

    // Any, all and sum

    function any (iterable) {
        for (var index = 0; index < iterable.length; index++) {
            if (bool (iterable [index])) {
                return true;
            }
        }
        return false;
    }
    function all (iterable) {
        for (var index = 0; index < iterable.length; index++) {
            if (! bool (iterable [index])) {
                return false;
            }
        }
        return true;
    }
    function sum (iterable) {
        var result = 0;
        for (var index = 0; index < iterable.length; index++) {
            result += iterable [index];
        }
        return result;
    }

    __all__.any = any;
    __all__.all = all;
    __all__.sum = sum;

    // Enumerate method, returning a zipped list
    function enumerate (iterable) {
        return zip (range (len (iterable)), iterable);
    }
    __all__.enumerate = enumerate;

    // Shallow and deepcopy

    function copy (anObject) {
        if (anObject == null || typeof anObject == "object") {
            return anObject;
        }
        else {
            var result = {};
            for (var attrib in obj) {
                if (anObject.hasOwnProperty (attrib)) {
                    result [attrib] = anObject [attrib];
                }
            }
            return result;
        }
    }
    __all__.copy = copy;

    function deepcopy (anObject) {
        if (anObject == null || typeof anObject == "object") {
            return anObject;
        }
        else {
            var result = {};
            for (var attrib in obj) {
                if (anObject.hasOwnProperty (attrib)) {
                    result [attrib] = deepcopy (anObject [attrib]);
                }
            }
            return result;
        }
    }
    __all__.deepcopy = deepcopy;

    // List extensions to Array

    function list (iterable) {                                      // All such creators should be callable without new
        var instance = iterable ? [] .slice.apply (iterable) : [];  // Spread iterable, n.b. array.slice (), so array before dot
        // Sort is the normal JavaScript sort, Python sort is a non-member function
        return instance;
    }
    __all__.list = list;
    Array.prototype.__class__ = list;   // All arrays are lists (not only if constructed by the list ctor), unless constructed otherwise
    list.__name__ = 'list';

    /*
    Array.from = function (iterator) { // !!! remove
        result = [];
        for (item of iterator) {
            result.push (item);
        }
        return result;
    }
    */

    Array.prototype.__iter__ = function () {return new __PyIterator__ (this);};

    Array.prototype.__getslice__ = function (start, stop, step) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }
        else if (stop > this.length) {
            stop = this.length;
        }

        var result = list ([]);
        for (var index = start; index < stop; index += step) {
            result.push (this [index]);
        }

        return result;
    };

    Array.prototype.__setslice__ = function (start, stop, step, source) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }

        if (step == null) { // Assign to 'ordinary' slice, replace subsequence
            Array.prototype.splice.apply (this, [start, stop - start] .concat (source));
        }
        else {              // Assign to extended slice, replace designated items one by one
            var sourceIndex = 0;
            for (var targetIndex = start; targetIndex < stop; targetIndex += step) {
                this [targetIndex] = source [sourceIndex++];
            }
        }
    };

    Array.prototype.__repr__ = function () {
        if (this.__class__ == set && !this.length) {
            return 'set()';
        }

        var result = !this.__class__ || this.__class__ == list ? '[' : this.__class__ == tuple ? '(' : '{';

        for (var index = 0; index < this.length; index++) {
            if (index) {
                result += ', ';
            }
            result += repr (this [index]);
        }

        if (this.__class__ == tuple && this.length == 1) {
            result += ',';
        }

        result += !this.__class__ || this.__class__ == list ? ']' : this.__class__ == tuple ? ')' : '}';;
        return result;
    };

    Array.prototype.__str__ = Array.prototype.__repr__;

    Array.prototype.append = function (element) {
        this.push (element);
    };

    Array.prototype.clear = function () {
        this.length = 0;
    };

    Array.prototype.extend = function (aList) {
        this.push.apply (this, aList);
    };

    Array.prototype.insert = function (index, element) {
        this.splice (index, 0, element);
    };

    Array.prototype.remove = function (element) {
        var index = this.indexOf (element);
        if (index == -1) {
            throw ValueError (new Error ());
        }
        this.splice (index, 1);
    };

    Array.prototype.index = function (element) {
        return this.indexOf (element);
    };

    Array.prototype.py_pop = function (index) {
        if (index == undefined) {
            return this.pop ();  // Remove last element
        }
        else {
            return this.splice (index, 1) [0];
        }
    };

    Array.prototype.py_sort = function () {
        __sort__.apply  (null, [this].concat ([] .slice.apply (arguments)));    // Can't work directly with arguments
        // Python params: (iterable, key = None, reverse = False)
        // py_sort is called with the Transcrypt kwargs mechanism, and just passes the params on to __sort__
        // __sort__ is def'ed with the Transcrypt kwargs mechanism
    };

    Array.prototype.__add__ = function (aList) {
        return list (this.concat (aList));
    };

    Array.prototype.__mul__ = function (scalar) {
        var result = this;
        for (var i = 1; i < scalar; i++) {
            result = result.concat (this);
        }
        return result;
    };

    Array.prototype.__rmul__ = Array.prototype.__mul__;

    // Tuple extensions to Array

    function tuple (iterable) {
        var instance = iterable ? [] .slice.apply (iterable) : [];
        instance.__class__ = tuple; // Not all arrays are tuples
        return instance;
    }
    __all__.tuple = tuple;
    tuple.__name__ = 'tuple';

    // Set extensions to Array
    // N.B. Since sets are unordered, set operations will occasionally alter the 'this' array by sorting it

    function set (iterable) {
        var instance = [];
        if (iterable) {
            for (var index = 0; index < iterable.length; index++) {
                instance.add (iterable [index]);
            }


        }
        instance.__class__ = set;   // Not all arrays are sets
        return instance;
    }
    __all__.set = set;
    set.__name__ = 'set';

    Array.prototype.__bindexOf__ = function (element) { // Used to turn O (n^2) into O (n log n)
    // Since sorting is lex, compare has to be lex. This also allows for mixed lists

        element += '';

        var mindex = 0;
        var maxdex = this.length - 1;

        while (mindex <= maxdex) {
            var index = (mindex + maxdex) / 2 | 0;
            var middle = this [index] + '';

            if (middle < element) {
                mindex = index + 1;
            }
            else if (middle > element) {
                maxdex = index - 1;
            }
            else {
                return index;
            }
        }

        return -1;
    };

    Array.prototype.add = function (element) {
        if (this.indexOf (element) == -1) { // Avoid duplicates in set
            this.push (element);
        }
    };

    Array.prototype.discard = function (element) {
        var index = this.indexOf (element);
        if (index != -1) {
            this.splice (index, 1);
        }
    };

    Array.prototype.isdisjoint = function (other) {
        this.sort ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) != -1) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.issuperset = function (other) {
        this.sort ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) == -1) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.issubset = function (other) {
        return set (other.slice ()) .issuperset (this); // Sort copy of 'other', not 'other' itself, since it may be an ordered sequence
    };

    Array.prototype.union = function (other) {
        var result = set (this.slice () .sort ());
        for (var i = 0; i < other.length; i++) {
            if (result.__bindexOf__ (other [i]) == -1) {
                result.push (other [i]);
            }
        }
        return result;
    };

    Array.prototype.intersection = function (other) {
        this.sort ();
        var result = set ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) != -1) {
                result.push (other [i]);
            }
        }
        return result;
    };

    Array.prototype.difference = function (other) {
        var sother = set (other.slice () .sort ());
        var result = set ();
        for (var i = 0; i < this.length; i++) {
            if (sother.__bindexOf__ (this [i]) == -1) {
                result.push (this [i]);
            }
        }
        return result;
    };

    Array.prototype.symmetric_difference = function (other) {
        return this.union (other) .difference (this.intersection (other));
    };

    Array.prototype.py_update = function () {   // O (n)
        var updated = [] .concat.apply (this.slice (), arguments) .sort ();
        this.clear ();
        for (var i = 0; i < updated.length; i++) {
            if (updated [i] != updated [i - 1]) {
                this.push (updated [i]);
            }
        }
    };

    Array.prototype.__eq__ = function (other) { // Also used for list
        if (this.length != other.length) {
            return false;
        }
        if (this.__class__ == set) {
            this.sort ();
            other.sort ();
        }
        for (var i = 0; i < this.length; i++) {
            if (this [i] != other [i]) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.__ne__ = function (other) { // Also used for list
        return !this.__eq__ (other);
    };

    Array.prototype.__le__ = function (other) {
        return this.issubset (other);
    };

    Array.prototype.__ge__ = function (other) {
        return this.issuperset (other);
    };

    Array.prototype.__lt__ = function (other) {
        return this.issubset (other) && !this.issuperset (other);
    };

    Array.prototype.__gt__ = function (other) {
        return this.issuperset (other) && !this.issubset (other);
    };

    // String extensions

    function str (stringable) {
        try {
            return stringable.__str__ ();
        }
        catch (exception) {
            try {
                return repr (stringable);
            }
            catch (exception) {
                return String (stringable); // No new, so no permanent String object but a primitive in a temporary 'just in time' wrapper
            }
        }
    };
    __all__.str = str;

    String.prototype.__class__ = str;   // All strings are str
    str.__name__ = 'str';

    String.prototype.__iter__ = function () {new __PyIterator__ (this);};

    String.prototype.__repr__ = function () {
        return (this.indexOf ('\'') == -1 ? '\'' + this + '\'' : '"' + this + '"') .py_replace ('\t', '\\t') .py_replace ('\n', '\\n');
    };

    String.prototype.__str__ = function () {
        return this;
    };

    String.prototype.capitalize = function () {
        return this.charAt (0).toUpperCase () + this.slice (1);
    };

    String.prototype.endswith = function (suffix) {
        return suffix == '' || this.slice (-suffix.length) == suffix;
    };

    String.prototype.find  = function (sub, start) {
        return this.indexOf (sub, start);
    };

    String.prototype.__getslice__ = function (start, stop, step) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }

        var result = '';
        if (step == 1) {
            result = this.substring (start, stop);
        }
        else {
            for (var index = start; index < stop; index += step) {
                result = result.concat (this.charAt(index));
            }
        }
        return result;
    }

    // Since it's worthwhile for the 'format' function to be able to deal with *args, it is defined as a property
    // __get__ will produce a bound function if there's something before the dot
    // Since a call using *args is compiled to e.g. <object>.<function>.apply (null, args), the function has to be bound already
    // Otherwise it will never be, because of the null argument
    // Using 'this' rather than 'null' contradicts the requirement to be able to pass bound functions around
    // The object 'before the dot' won't be available at call time in that case, unless implicitly via the function bound to it
    // While for Python methods this mechanism is generated by the compiler, for JavaScript methods it has to be provided manually
    // Call memoizing is unattractive here, since every string would then have to hold a reference to a bound format method
    __setProperty__ (String.prototype, 'format', {
        get: function () {return __get__ (this, function (self) {
            var args = tuple ([] .slice.apply (arguments).slice (1));
            var autoIndex = 0;
            return self.replace (/\{(\w*)\}/g, function (match, key) {
                if (key == '') {
                    key = autoIndex++;
                }
                if (key == +key) {  // So key is numerical
                    return args [key] == undefined ? match : str (args [key]);
                }
                else {              // Key is a string
                    for (var index = 0; index < args.length; index++) {
                        // Find first 'dict' that has that key and the right field
                        if (typeof args [index] == 'object' && args [index][key] != undefined) {
                            return str (args [index][key]); // Return that field field
                        }
                    }
                    return match;
                }
            });
        });},
        enumerable: true
    });

    String.prototype.isalnum = function () {
        return /^[0-9a-zA-Z]{1,}$/.test(this)
    }

    String.prototype.isalpha = function () {
        return /^[a-zA-Z]{1,}$/.test(this)
    }

    String.prototype.isdecimal = function () {
        return /^[0-9]{1,}$/.test(this)
    }

    String.prototype.isdigit = function () {
        return this.isdecimal()
    }

    String.prototype.islower = function () {
        return /^[a-z]{1,}$/.test(this)
    }

    String.prototype.isupper = function () {
        return /^[A-Z]{1,}$/.test(this)
    }

    String.prototype.isspace = function () {
        return /^[\s]{1,}$/.test(this)
    }

    String.prototype.isnumeric = function () {
        return !isNaN (parseFloat (this)) && isFinite (this);
    };

    String.prototype.join = function (strings) {
        return strings.join (this);
    };

    String.prototype.lower = function () {
        return this.toLowerCase ();
    };

    String.prototype.py_replace = function (old, aNew, maxreplace) {
        return this.split (old, maxreplace) .join (aNew);
    };

    String.prototype.lstrip = function () {
        return this.replace (/^\s*/g, '');
    };

    String.prototype.rfind = function (sub, start) {
        return this.lastIndexOf (sub, start);
    };

    String.prototype.rsplit = function (sep, maxsplit) {    // Combination of general whitespace sep and positive maxsplit neither supported nor checked, expensive and rare
        if (sep == undefined || sep == null) {
            sep = /\s+/;
            var stripped = this.strip ();
        }
        else {
            var stripped = this;
        }

        if (maxsplit == undefined || maxsplit == -1) {
            return stripped.split (sep);
        }
        else {
            var result = stripped.split (sep);
            if (maxsplit < result.length) {
                var maxrsplit = result.length - maxsplit;
                return [result.slice (0, maxrsplit) .join (sep)] .concat (result.slice (maxrsplit));
            }
            else {
                return result;
            }
        }
    };

    String.prototype.rstrip = function () {
        return this.replace (/\s*$/g, '');
    };

    String.prototype.py_split = function (sep, maxsplit) {  // Combination of general whitespace sep and positive maxsplit neither supported nor checked, expensive and rare
        if (sep == undefined || sep == null) {
            sep = /\s+/;
            var stripped = this.strip ();
        }
        else {
            var stripped = this;
        }

        if (maxsplit == undefined || maxsplit == -1) {
            return stripped.split (sep);
        }
        else {
            var result = stripped.split (sep);
            if (maxsplit < result.length) {
                return result.slice (0, maxsplit).concat ([result.slice (maxsplit).join (sep)]);
            }
            else {
                return result;
            }
        }
    };

    String.prototype.startswith = function (prefix) {
        return this.indexOf (prefix) == 0;
    };

    String.prototype.strip = function () {
        return this.trim ();
    };

    String.prototype.upper = function () {
        return this.toUpperCase ();
    };

    String.prototype.__mul__ = function (scalar) {
        var result = this;
        for (var i = 1; i < scalar; i++) {
            result = result + this;
        }
        return result;
    };

    String.prototype.__rmul__ = String.prototype.__mul__;

    // Dict extensions to object

    function __keys__ () {
        var keys = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                keys.push (attrib);
            }
        }
        return keys;
    }

    function __items__ () {
        var items = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                items.push ([attrib, this [attrib]]);
            }
        }
        return items;
    }

    function __del__ (key) {
        delete this [key];
    }

    function __clear__ () {
        for (var attrib in this) {
            delete this [attrib];
        }
    }

    function __getdefault__ (aKey, aDefault) {  // Each Python object already has a function called __get__, so we call this one __getdefault__
        var result = this [aKey];
        return result == undefined ? (aDefault == undefined ? null : aDefault) : result;
    }

    function __setdefault__ (aKey, aDefault) {
        var result = this [aKey];
        if (result != undefined) {
            return result;
        }
        var val = aDefault == undefined ? null : aDefault;
        this [aKey] = val;
        return val;
    }

    function __pop__ (aKey, aDefault) {
        var result = this [aKey];
        if (result != undefined) {
            delete this [aKey];
            return result;
        } else {
            // Identify check because user could pass None
            if ( aDefault === undefined ) {
                throw KeyError (aKey, new Error());
            }
        }
        return aDefault;
    }
    
    function __popitem__ () {
        var aKey = Object.keys (this) [0];
        if (aKey == null) {
            throw KeyError (aKey, new Error ());
        }
        var result = tuple ([aKey, this [aKey]]);
        delete this [aKey];
        return result;
    }
    
    function __update__ (aDict) {
        for (var aKey in aDict) {
            this [aKey] = aDict [aKey];
        }
    }
    
    function __values__ () {
        var values = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                values.push (this [attrib]);
            }
        }
        return values;

    }
    
    function __dgetitem__ (aKey) {
        return this [aKey];
    }
    
    function __dsetitem__ (aKey, aValue) {
        this [aKey] = aValue;
    }

    function dict (objectOrPairs) {
        var instance = {};
        if (!objectOrPairs || objectOrPairs instanceof Array) { // It's undefined or an array of pairs
            if (objectOrPairs) {
                for (var index = 0; index < objectOrPairs.length; index++) {
                    var pair = objectOrPairs [index];
                    if ( !(pair instanceof Array) || pair.length != 2) {
                        throw ValueError(
                            "dict update sequence element #" + index +
                            " has length " + pair.length +
                            "; 2 is required", new Error());
                    }
                    var key = pair [0];
                    var val = pair [1];
                    if (!(objectOrPairs instanceof Array) && objectOrPairs instanceof Object) {
                         // User can potentially pass in an object
                         // that has a hierarchy of objects. This
                         // checks to make sure that these objects
                         // get converted to dict objects instead of
                         // leaving them as js objects.
                         
                         if (!isinstance (objectOrPairs, dict)) {
                             val = dict (val);
                         }
                    }
                    instance [key] = val;
                }
            }
        }
        else {
            if (isinstance (objectOrPairs, dict)) {
                // Passed object is a dict already so we need to be a little careful
                // N.B. - this is a shallow copy per python std - so
                // it is assumed that children have already become
                // python objects at some point.
                
                var aKeys = objectOrPairs.py_keys ();
                for (var index = 0; index < aKeys.length; index++ ) {
                    var key = aKeys [index];
                    instance [key] = objectOrPairs [key];
                }
            } else if (objectOrPairs instanceof Object) {
                // Passed object is a JavaScript object but not yet a dict, don't copy it
                instance = objectOrPairs;
            } else {
                // We have already covered Array so this indicates
                // that the passed object is not a js object - i.e.
                // it is an int or a string, which is invalid.
                
                throw ValueError ("Invalid type of object for dict creation", new Error ());
            }
        }

        // Trancrypt interprets e.g. {aKey: 'aValue'} as a Python dict literal rather than a JavaScript object literal
        // So dict literals rather than bare Object literals will be passed to JavaScript libraries
        // Some JavaScript libraries call all enumerable callable properties of an object that's passed to them
        // So the properties of a dict should be non-enumerable
        __setProperty__ (instance, '__class__', {value: dict, enumerable: false, writable: true});
        __setProperty__ (instance, 'py_keys', {value: __keys__, enumerable: false});
        __setProperty__ (instance, '__iter__', {value: function () {new __PyIterator__ (this.py_keys ());}, enumerable: false});
        __setProperty__ (instance, Symbol.iterator, {value: function () {new __JsIterator__ (this.py_keys ());}, enumerable: false});
        __setProperty__ (instance, 'py_items', {value: __items__, enumerable: false});
        __setProperty__ (instance, 'py_del', {value: __del__, enumerable: false});
        __setProperty__ (instance, 'py_clear', {value: __clear__, enumerable: false});
        __setProperty__ (instance, 'py_get', {value: __getdefault__, enumerable: false});
        __setProperty__ (instance, 'py_setdefault', {value: __setdefault__, enumerable: false});
        __setProperty__ (instance, 'py_pop', {value: __pop__, enumerable: false});
        __setProperty__ (instance, 'py_popitem', {value: __popitem__, enumerable: false});
        __setProperty__ (instance, 'py_update', {value: __update__, enumerable: false});
        __setProperty__ (instance, 'py_values', {value: __values__, enumerable: false});
        __setProperty__ (instance, '__getitem__', {value: __dgetitem__, enumerable: false});    // Needed since compound keys necessarily
        __setProperty__ (instance, '__setitem__', {value: __dsetitem__, enumerable: false});    // trigger overloading to deal with slices
        return instance;
    }

    __all__.dict = dict;
    dict.__name__ = 'dict';
    
    // Docstring setter

    function __setdoc__ (docString) {
        this.__doc__ = docString;
        return this;
    }

    // Python classes, methods and functions are all translated to JavaScript functions
    __setProperty__ (Function.prototype, '__setdoc__', {value: __setdoc__, enumerable: false});

    // General operator overloading, only the ones that make most sense in matrix and complex operations

    var __neg__ = function (a) {
        if (typeof a == 'object' && '__neg__' in a) {
            return a.__neg__ ();
        }
        else {
            return -a;
        }
    };
    __all__.__neg__ = __neg__;

    var __matmul__ = function (a, b) {
        return a.__matmul__ (b);
    };
    __all__.__matmul__ = __matmul__;

    var __pow__ = function (a, b) {
        if (typeof a == 'object' && '__pow__' in a) {
            return a.__pow__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rpow__ (a);
        }
        else {
            return Math.pow (a, b);
        }
    };
    __all__.pow = __pow__;

    var __jsmod__ = function (a, b) {
        if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return a % b;
        }
    };
    __all__.__jsmod__ = __jsmod__;
    
    var __mod__ = function (a, b) {
        if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return ((a % b) + b) % b;
        }
    };
    __all__.mod = __mod__;

    // Overloaded binary arithmetic
    
    var __mul__ = function (a, b) {
        if (typeof a == 'object' && '__mul__' in a) {
            return a.__mul__ (b);
        }
        else if (typeof b == 'object' && '__rmul__' in b) {
            return b.__rmul__ (a);
        }
        else if (typeof a == 'string') {
            return a.__mul__ (b);
        }
        else if (typeof b == 'string') {
            return b.__rmul__ (a);
        }
        else {
            return a * b;
        }
    };
    __all__.__mul__ = __mul__;

    var __div__ = function (a, b) {
        if (typeof a == 'object' && '__div__' in a) {
            return a.__div__ (b);
        }
        else if (typeof b == 'object' && '__rdiv__' in b) {
            return b.__rdiv__ (a);
        }
        else {
            return a / b;
        }
    };
    __all__.__div__ = __div__;

    var __add__ = function (a, b) {
        if (typeof a == 'object' && '__add__' in a) {
            return a.__add__ (b);
        }
        else if (typeof b == 'object' && '__radd__' in b) {
            return b.__radd__ (a);
        }
        else {
            return a + b;
        }
    };
    __all__.__add__ = __add__;

    var __sub__ = function (a, b) {
        if (typeof a == 'object' && '__sub__' in a) {
            return a.__sub__ (b);
        }
        else if (typeof b == 'object' && '__rsub__' in b) {
            return b.__rsub__ (a);
        }
        else {
            return a - b;
        }
    };
    __all__.__sub__ = __sub__;

    // Overloaded binary bitwise
    
    var __lshift__ = function (a, b) {
        if (typeof a == 'object' && '__lshift__' in a) {
            return a.__lshift__ (b);
        }
        else if (typeof b == 'object' && '__rlshift__' in b) {
            return b.__rlshift__ (a);
        }
        else {
            return a << b;
        }
    };
    __all__.__lshift__ = __lshift__;

    var __rshift__ = function (a, b) {
        if (typeof a == 'object' && '__rshift__' in a) {
            return a.__rshift__ (b);
        }
        else if (typeof b == 'object' && '__rrshift__' in b) {
            return b.__rrshift__ (a);
        }
        else {
            return a >> b;
        }
    };
    __all__.__rshift__ = __rshift__;

    var __or__ = function (a, b) {
        if (typeof a == 'object' && '__or__' in a) {
            return a.__or__ (b);
        }
        else if (typeof b == 'object' && '__ror__' in b) {
            return b.__ror__ (a);
        }
        else {
            return a | b;
        }
    };
    __all__.__or__ = __or__;

    var __xor__ = function (a, b) {
        if (typeof a == 'object' && '__xor__' in a) {
            return a.__xor__ (b);
        }
        else if (typeof b == 'object' && '__rxor__' in b) {
            return b.__rxor__ (a);
        }
        else {
            return a ^ b;
        }
    };
    __all__.__xor__ = __xor__;

    var __and__ = function (a, b) {
        if (typeof a == 'object' && '__and__' in a) {
            return a.__and__ (b);
        }
        else if (typeof b == 'object' && '__rand__' in b) {
            return b.__rand__ (a);
        }
        else {
            return a & b;
        }
    };
    __all__.__and__ = __and__;

    // Overloaded binary compare
    
    var __eq__ = function (a, b) {
        if (typeof a == 'object' && '__eq__' in a) {
            return a.__eq__ (b);
        }
        else {
            return a == b;
        }
    };
    __all__.__eq__ = __eq__;

    var __ne__ = function (a, b) {
        if (typeof a == 'object' && '__ne__' in a) {
            return a.__ne__ (b);
        }
        else {
            return a != b
        }
    };
    __all__.__ne__ = __ne__;

    var __lt__ = function (a, b) {
        if (typeof a == 'object' && '__lt__' in a) {
            return a.__lt__ (b);
        }
        else {
            return a < b;
        }
    };
    __all__.__lt__ = __lt__;

    var __le__ = function (a, b) {
        if (typeof a == 'object' && '__le__' in a) {
            return a.__le__ (b);
        }
        else {
            return a <= b;
        }
    };
    __all__.__le__ = __le__;

    var __gt__ = function (a, b) {
        if (typeof a == 'object' && '__gt__' in a) {
            return a.__gt__ (b);
        }
        else {
            return a > b;
        }
    };
    __all__.__gt__ = __gt__;

    var __ge__ = function (a, b) {
        if (typeof a == 'object' && '__ge__' in a) {
            return a.__ge__ (b);
        }
        else {
            return a >= b;
        }
    };
    __all__.__ge__ = __ge__;
    
    // Overloaded augmented general
    
    var __imatmul__ = function (a, b) {
        if ('__imatmul__' in a) {
            return a.__imatmul__ (b);
        }
        else {
            return a.__matmul__ (b);
        }
    };
    __all__.__imatmul__ = __imatmul__;

    var __ipow__ = function (a, b) {
        if (typeof a == 'object' && '__pow__' in a) {
            return a.__ipow__ (b);
        }
        else if (typeof a == 'object' && '__ipow__' in a) {
            return a.__pow__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rpow__ (a);
        }
        else {
            return Math.pow (a, b);
        }
    };
    __all__.ipow = __ipow__;

    var __ijsmod__ = function (a, b) {
        if (typeof a == 'object' && '__imod__' in a) {
            return a.__ismod__ (b);
        }
        else if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return a % b;
        }
    };
    __all__.ijsmod__ = __ijsmod__;
    
    var __imod__ = function (a, b) {
        if (typeof a == 'object' && '__imod__' in a) {
            return a.__imod__ (b);
        }
        else if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return ((a % b) + b) % b;
        }
    };
    __all__.imod = __imod__;
    
    // Overloaded augmented arithmetic
    
    var __imul__ = function (a, b) {
        if (typeof a == 'object' && '__imul__' in a) {
            return a.__imul__ (b);
        }
        else if (typeof a == 'object' && '__mul__' in a) {
            return a = a.__mul__ (b);
        }
        else if (typeof b == 'object' && '__rmul__' in b) {
            return a = b.__rmul__ (a);
        }
        else if (typeof a == 'string') {
            return a = a.__mul__ (b);
        }
        else if (typeof b == 'string') {
            return a = b.__rmul__ (a);
        }
        else {
            return a *= b;
        }
    };
    __all__.__imul__ = __imul__;

    var __idiv__ = function (a, b) {
        if (typeof a == 'object' && '__idiv__' in a) {
            return a.__idiv__ (b);
        }
        else if (typeof a == 'object' && '__div__' in a) {
            return a = a.__div__ (b);
        }
        else if (typeof b == 'object' && '__rdiv__' in b) {
            return a = b.__rdiv__ (a);
        }
        else {
            return a /= b;
        }
    };
    __all__.__idiv__ = __idiv__;

    var __iadd__ = function (a, b) {
        if (typeof a == 'object' && '__iadd__' in a) {
            return a.__iadd__ (b);
        }
        else if (typeof a == 'object' && '__add__' in a) {
            return a = a.__add__ (b);
        }
        else if (typeof b == 'object' && '__radd__' in b) {
            return a = b.__radd__ (a);
        }
        else {
            return a += b;
        }
    };
    __all__.__iadd__ = __iadd__;

    var __isub__ = function (a, b) {
        if (typeof a == 'object' && '__isub__' in a) {
            return a.__isub__ (b);
        }
        else if (typeof a == 'object' && '__sub__' in a) {
            return a = a.__sub__ (b);
        }
        else if (typeof b == 'object' && '__rsub__' in b) {
            return a = b.__rsub__ (a);
        }
        else {
            return a -= b;
        }
    };
    __all__.__isub__ = __isub__;

    // Overloaded augmented bitwise
    
    var __ilshift__ = function (a, b) {
        if (typeof a == 'object' && '__ilshift__' in a) {
            return a.__ilshift__ (b);
        }
        else if (typeof a == 'object' && '__lshift__' in a) {
            return a = a.__lshift__ (b);
        }
        else if (typeof b == 'object' && '__rlshift__' in b) {
            return a = b.__rlshift__ (a);
        }
        else {
            return a <<= b;
        }
    };
    __all__.__ilshift__ = __ilshift__;

    var __irshift__ = function (a, b) {
        if (typeof a == 'object' && '__irshift__' in a) {
            return a.__irshift__ (b);
        }
        else if (typeof a == 'object' && '__rshift__' in a) {
            return a = a.__rshift__ (b);
        }
        else if (typeof b == 'object' && '__rrshift__' in b) {
            return a = b.__rrshift__ (a);
        }
        else {
            return a >>= b;
        }
    };
    __all__.__irshift__ = __irshift__;

    var __ior__ = function (a, b) {
        if (typeof a == 'object' && '__ior__' in a) {
            return a.__ior__ (b);
        }
        else if (typeof a == 'object' && '__or__' in a) {
            return a = a.__or__ (b);
        }
        else if (typeof b == 'object' && '__ror__' in b) {
            return a = b.__ror__ (a);
        }
        else {
            return a |= b;
        }
    };
    __all__.__ior__ = __ior__;

    var __ixor__ = function (a, b) {
        if (typeof a == 'object' && '__ixor__' in a) {
            return a.__ixor__ (b);
        }
        else if (typeof a == 'object' && '__xor__' in a) {
            return a = a.__xor__ (b);
        }
        else if (typeof b == 'object' && '__rxor__' in b) {
            return a = b.__rxor__ (a);
        }
        else {
            return a ^= b;
        }
    };
    __all__.__ixor__ = __ixor__;

    var __iand__ = function (a, b) {
        if (typeof a == 'object' && '__iand__' in a) {
            return a.__iand__ (b);
        }
        else if (typeof a == 'object' && '__and__' in a) {
            return a = a.__and__ (b);
        }
        else if (typeof b == 'object' && '__rand__' in b) {
            return a = b.__rand__ (a);
        }
        else {
            return a &= b;
        }
    };
    __all__.__iand__ = __iand__;
    
    // Indices and slices

    var __getitem__ = function (container, key) {                           // Slice c.q. index, direct generated call to runtime switch
        if (typeof container == 'object' && '__getitem__' in container) {
            return container.__getitem__ (key);                             // Overloaded on container
        }
        else {
            return container [key];                                         // Container must support bare JavaScript brackets
        }
    };
    __all__.__getitem__ = __getitem__;

    var __setitem__ = function (container, key, value) {                    // Slice c.q. index, direct generated call to runtime switch
        if (typeof container == 'object' && '__setitem__' in container) {
            container.__setitem__ (key, value);                             // Overloaded on container
        }
        else {
            container [key] = value;                                        // Container must support bare JavaScript brackets
        }
    };
    __all__.__setitem__ = __setitem__;

    var __getslice__ = function (container, lower, upper, step) {           // Slice only, no index, direct generated call to runtime switch
        if (typeof container == 'object' && '__getitem__' in container) {
            return container.__getitem__ ([lower, upper, step]);            // Container supports overloaded slicing c.q. indexing
        }
        else {
            return container.__getslice__ (lower, upper, step);             // Container only supports slicing injected natively in prototype
        }
    };
    __all__.__getslice__ = __getslice__;

    var __setslice__ = function (container, lower, upper, step, value) {    // Slice, no index, direct generated call to runtime switch
        if (typeof container == 'object' && '__setitem__' in container) {
            container.__setitem__ ([lower, upper, step], value);            // Container supports overloaded slicing c.q. indexing
        }
        else {
            container.__setslice__ (lower, upper, step, value);             // Container only supports slicing injected natively in prototype
        }
    };
    __all__.__setslice__ = __setslice__;
	__nest__ (
		__all__,
		'pylib.inspector', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var server = __init__ (__world__.pylib.server);
					var Tab = __class__ ('Tab', [object], {
						Name: '',
						Data_tab: '',
						Active: false,
						get __init__ () {return __get__ (this, function (self) {
							self._menu_attrs = dict ({'data-tab': self.Data_tab});
							self._tab_attrs = dict ({'data-tab': self.Data_tab});
							self._menu = 'a.item';
							self._tab = 'div.ui.bottom.attached.tab.segment';
							if (self.Active) {
								self._menu += '.active';
								self._tab += '.active';
							}
						});},
						get menu_item () {return __get__ (this, function (self) {
							return m (self._menu, self._menu_attrs, self.Name);
						});},
						get tab_item () {return __get__ (this, function (self) {
							return m (self._tab, self._tab_attrs, self.main_view ());
						});},
						get main_view () {return __get__ (this, function (self) {
							return m ('div', 'hello ' + self.Name);
						});}
					});
					var TabledTab = __class__ ('TabledTab', [Tab], {
						get __init__ () {return __get__ (this, function (self) {
							__super__ (TabledTab, '__init__') (self);
							self.table = null;
							self.setup_table ();
							self.copiedDetails = '';
							self._detailsId = self.Data_tab + 'DetailsCodeBlock';
							self._copiedId = self.Data_tab + 'CopiedCodeBlock';
							self._copyButtonId = self.Data_tab + 'CopyButton';
							self._clearButtonId = self.Data_tab + 'ClearButton';
						});},
						get setup_table () {return __get__ (this, function (self) {
							self.table = Table (list ([]));
						});},
						get _copyDetails () {return __get__ (this, function (self) {
							self.copiedDetails = self.table.detailSelected;
						});},
						get _clearCopy () {return __get__ (this, function (self) {
							self.copiedDetails = '';
						});},
						get main_view () {return __get__ (this, function (self) {
							return m ('div', m ('div.table-container', m (self.table.view)), m ('div.ui.hidden.divider'), m ('div.ui.two.cards', dict ({'style': 'height: 45%;'}), m ('div.ui.card', m ('div.content.small-header', m ('div.header', m ('span', 'Details'), m ('span.ui.mini.right.floated.button', dict ({'onclick': self._copyDetails, 'id': self._copyButtonId}), 'Copy'))), m ('pre.content.code-block', dict ({'id': self._detailsId}), self.table.detailSelected)), m ('div.ui.card', m ('div.content.small-header', m ('div.header', m ('span', 'Copied'), m ('span.ui.mini.right.floated.button', dict ({'onclick': self._clearCopy, 'id': self._clearButtonId}), 'Clear'))), m ('pre.content.code-block', dict ({'id': self._copiedId}), self.copiedDetails))));
						});}
					});
					var Field = __class__ ('Field', [object], {
						Title: null,
						Length: 4,
						get __init__ () {return __get__ (this, function (self, title) {
							if (typeof title == 'undefined' || (title != null && title .hasOwnProperty ("__kwargtrans__"))) {;
								var title = null;
							};
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'title': var title = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
							}
							else {
							}
							self.title = self.Title;
							if (title !== null) {
								self.title = title;
							}
							self.py_name = self.title.lower ();
						});},
						get format () {return __get__ (this, function (self, data) {
							return str (data);
						});},
						get shorten () {return __get__ (this, function (self, string) {
							if (len (string) > self.Length + 3) {
								var string = string.__getslice__ (0, self.Length, 1) + '...';
							}
							return string;
						});},
						get view () {return __get__ (this, function (self, data) {
							if (data == null) {
								var data = '';
							}
							var formatted = self.format (data);
							return m ('td', dict ({'title': formatted}), self.shorten (formatted));
						});}
					});
					var FillField = __class__ ('FillField', [Field], {
						Length: 100,
						get view () {return __get__ (this, function (self, data) {
							var node = __super__ (FillField, 'view') (self, data);
							node.attrs ['class'] = 'fill-space';
							return node;
						});}
					});
					var DateField = __class__ ('DateField', [Field], {
						Length: 12,
						Title: 'Date'
					});
					var EpochField = __class__ ('EpochField', [DateField], {
						get format () {return __get__ (this, function (self, data) {
							var data = new Date (data / 1000).toISOString ();
							return __super__ (EpochField, 'format') (self, data);
						});}
					});
					var IDField = __class__ ('IDField', [Field], {
						Length: 4,
						Title: 'UID',
						Header: '',
						get format () {return __get__ (this, function (self, string) {
							if (string.startswith (self.Header)) {
								var string = string.__getslice__ (len (self.Header), null, 1);
							}
							return __super__ (IDField, 'format') (self, string);
						});}
					});
					var DIDField = __class__ ('DIDField', [IDField], {
						Header: 'did:igo:',
						Title: 'DID'
					});
					var HIDField = __class__ ('HIDField', [IDField], {
						Header: 'hid:',
						Title: 'HID',
						get shorten () {return __get__ (this, function (self, string) {
							if (len (string) > 13) {
								var string = (string.__getslice__ (0, 6, 1) + '...') + string.__getslice__ (-(4), null, 1);
							}
							return string;
						});}
					});
					var OIDField = __class__ ('OIDField', [IDField], {
						Header: 'o_'
					});
					var MIDField = __class__ ('MIDField', [IDField], {
						Header: 'm_'
					});
					var Table = __class__ ('Table', [object], {
						no_results_text: 'No results found.',
						get __init__ () {return __get__ (this, function (self, fields) {
							self.max_size = 20;
							self.fields = fields;
							self.data = dict ({});
							self.view = dict ({'oninit': self._oninit, 'view': self._view});
							self._selectedRow = null;
							self._selectedUid = null;
							self.detailSelected = '';
							self.filter = null;
							self._nextId = 0;
						});},
						get _stringify () {return __get__ (this, function (self, obj) {
							return JSON.stringify (obj, null, 2);
						});},
						get _selectRow () {return __get__ (this, function (self, event, uid) {
							if (uid == self._selectedUid) {
								return ;
							}
							self._selectedUid = uid;
							if (self._selectedRow !== null) {
								jQuery (self._selectedRow).removeClass ('active');
							}
							self._selectedRow = event.currentTarget;
							jQuery (self._selectedRow).addClass ('active');
							self.detailSelected = self._stringify (self.data [uid]);
						});},
						get _oninit () {return __get__ (this, function (self) {
							var data = list ([]);
							for (var i = 0; i < 20; i++) {
								var obj = dict ({});
								var __iterable0__ = self.fields;
								for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
									var field = __iterable0__ [__index0__];
									obj [field.py_name] = 'test{0} {1}'.format (i, field.py_name);
								}
								data.append (obj);
							}
							self._setData (data);
						});},
						get _setData () {return __get__ (this, function (self, data, py_clear) {
							if (typeof py_clear == 'undefined' || (py_clear != null && py_clear .hasOwnProperty ("__kwargtrans__"))) {;
								var py_clear = true;
							};
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'data': var data = __allkwargs0__ [__attrib0__]; break;
											case 'py_clear': var py_clear = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
							}
							else {
							}
							if (py_clear) {
								self._nextId = 0;
								self.data.py_clear ();
							}
							var __iterable0__ = data;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var datum = __iterable0__ [__index0__];
								self.data [self._nextId] = datum;
								self._nextId++;
							}
						});},
						get _makeRow () {return __get__ (this, function (self, obj) {
							return function () {
								var __accu0__ = [];
								var __iterable0__ = self.fields;
								for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
									var field = __iterable0__ [__index0__];
									__accu0__.append (field.view (obj [field.py_name]));
								}
								return __accu0__;
							} ();
						});},
						get _view () {return __get__ (this, function (self) {
							var headers = function () {
								var __accu0__ = [];
								var __iterable0__ = self.fields;
								for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
									var field = __iterable0__ [__index0__];
									__accu0__.append (m ('th', field.title));
								}
								return __accu0__;
							} ();
							var rows = list ([]);
							var count = 0;
							var __iterable0__ = self.data.py_items ();
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var __left0__ = __iterable0__ [__index0__];
								var key = __left0__ [0];
								var obj = __left0__ [1];
								if (count >= self.max_size) {
									rows.append (m ('tr', m ('td', 'Limited to {} results.'.format (self.max_size))));
									break;
								}
								if (self.filter !== null) {
									if (!(self.filter (obj))) {
										continue;
									}
								}
								var row = self._makeRow (obj);
								var makeScope = function (uid) {
									return (function __lambda__ (event) {
										return self._selectRow (event, uid);
									});
								};
								rows.append (m ('tr', dict ({'onclick': makeScope (key)}), row));
								count++;
							}
							if (!(count)) {
								rows.append (m ('tr', m ('td', self.no_results_text)));
							}
							return m ('table', dict ({'class': 'ui selectable celled unstackable single line left aligned table'}), m ('thead', m ('tr', dict ({'class': 'center aligned'}), headers)), m ('tbody', rows));
						});}
					});
					var AnonMsgsTable = __class__ ('AnonMsgsTable', [Table], {
						get __init__ () {return __get__ (this, function (self) {
							var fields = list ([IDField ('UID'), DateField (), EpochField ('Created'), EpochField ('Expire'), FillField ('Content')]);
							__super__ (AnonMsgsTable, '__init__') (self, fields);
						});},
						get _oninit () {return __get__ (this, function (self) {
							var msgs = server.manager.anonMsgs;
							msgs.refresh ().then ((function __lambda__ () {
								return self._setData (msgs.messages);
							}));
						});},
						get _makeRow () {return __get__ (this, function (self, obj) {
							var row = list ([]);
							var __iterable0__ = self.fields;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var field = __iterable0__ [__index0__];
								if (field.py_name == 'uid') {
									var data = obj.anon.uid;
								}
								else if (field.py_name == 'date') {
									var data = obj.anon.date;
								}
								else if (field.py_name == 'content') {
									var data = obj.anon.content;
								}
								else if (field.py_name == 'created') {
									var data = obj.create;
								}
								else {
									var data = obj [field.py_name];
								}
								row.append (field.view (data));
							}
							return row;
						});}
					});
					var EntitiesTable = __class__ ('EntitiesTable', [Table], {
						get __init__ () {return __get__ (this, function (self) {
							var fields = list ([DIDField (), HIDField (), DIDField ('Signer'), DateField ('Changed'), Field ('Issuants'), FillField ('Data'), Field ('Keys')]);
							__super__ (EntitiesTable, '__init__') (self, fields);
						});},
						get _oninit () {return __get__ (this, function (self) {
							var entities = server.manager.entities;
							entities.refreshAgents ().then ((function __lambda__ () {
								return self._setData (entities.agents, __kwargtrans__ ({py_clear: false}));
							}));
							entities.refreshThings ().then ((function __lambda__ () {
								return self._setData (entities.things, __kwargtrans__ ({py_clear: false}));
							}));
						});},
						get _makeRow () {return __get__ (this, function (self, obj) {
							var row = list ([]);
							var __iterable0__ = self.fields;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var field = __iterable0__ [__index0__];
								if (field.py_name == 'issuants') {
									var issuants = obj [field.py_name];
									if (issuants) {
										var data = len (issuants);
									}
									else {
										var data = '';
									}
								}
								else if (field.py_name == 'keys') {
									var py_keys = obj [field.py_name];
									if (py_keys) {
										var data = len (py_keys);
									}
									else {
										var data = '';
									}
								}
								else if (field.py_name == 'data') {
									var d = obj [field.py_name];
									if (d && d.keywords && d.message) {
										var data = ' '.join (d.keywords);
										data += ' ' + d.message;
									}
									else {
										var data = '';
									}
								}
								else {
									var data = obj [field.py_name];
								}
								row.append (field.view (data));
							}
							return row;
						});}
					});
					var Entities = __class__ ('Entities', [TabledTab], {
						Name: 'Entities',
						Data_tab: 'entities',
						Active: true,
						get setup_table () {return __get__ (this, function (self) {
							self.table = EntitiesTable ();
						});}
					});
					var Issuants = __class__ ('Issuants', [TabledTab], {
						Name: 'Issuants',
						Data_tab: 'issuants'
					});
					var Offers = __class__ ('Offers', [TabledTab], {
						Name: 'Offers',
						Data_tab: 'offers'
					});
					var Messages = __class__ ('Messages', [TabledTab], {
						Name: 'Messages',
						Data_tab: 'messages'
					});
					var AnonMsgs = __class__ ('AnonMsgs', [TabledTab], {
						Name: 'Anon Msgs',
						Data_tab: 'anonmsgs',
						get setup_table () {return __get__ (this, function (self) {
							self.table = AnonMsgsTable ();
						});}
					});
					var Searcher = __class__ ('Searcher', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.searchTerm = null;
							self.caseSensitive = false;
						});},
						get setSearch () {return __get__ (this, function (self, term) {
							self.searchTerm = term || '';
							self.caseSensitive = self.searchTerm.startswith ('"') && self.searchTerm.endswith ('"');
							if (self.caseSensitive) {
								self.searchTerm = self.searchTerm.__getslice__ (1, -(1), 1);
							}
							else {
								self.searchTerm = self.searchTerm.lower ();
							}
						});},
						get _checkPrimitive () {return __get__ (this, function (self, item) {
							if (isinstance (item, str)) {
								if (!(self.caseSensitive)) {
									var item = item.lower ();
								}
								return __in__ (self.searchTerm, item);
							}
							return false;
						});},
						get _checkAny () {return __get__ (this, function (self, value) {
							if (isinstance (value, dict) || isinstance (value, Object)) {
								return self.search (value);
							}
							else if (isinstance (value, list)) {
								var __iterable0__ = value;
								for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
									var item = __iterable0__ [__index0__];
									if (self._checkAny (item)) {
										return true;
									}
								}
								return false;
							}
							else {
								return self._checkPrimitive (value);
							}
						});},
						get search () {return __get__ (this, function (self, obj) {
							for (var key in obj) {
								var value = obj [key];
								if (self._checkAny (value)) {
									return true;
								}
							}
							return false;
						});}
					});
					var Tabs = __class__ ('Tabs', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.tabs = list ([Entities (), Issuants (), Offers (), Messages (), AnonMsgs ()]);
							self._searchId = 'inspectorSearchId';
							self.searcher = Searcher ();
							jQuery (document).ready ((function __lambda__ () {
								return jQuery ('.menu > a.item').tab ();
							}));
						});},
						get currentTab () {return __get__ (this, function (self) {
							var active = jQuery ('.menu a.item.active');
							var data_tab = active.attr ('data-tab');
							var __iterable0__ = self.tabs;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var tab = __iterable0__ [__index0__];
								if (tab.Data_tab == data_tab) {
									return tab;
								}
							}
							return null;
						});},
						get search () {return __get__ (this, function (self) {
							var text = jQuery ('#' + self._searchId).val ();
							self.searcher.setSearch (text);
							var current = self.currentTab ();
							var __iterable0__ = self.tabs;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var tab = __iterable0__ [__index0__];
								if (text && tab.Data_tab == current.Data_tab) {
									tab.table.filter = self.searcher.search;
								}
								else {
									tab.table.filter = null;
								}
							}
						});},
						get view () {return __get__ (this, function (self) {
							var menu_items = list ([]);
							var tab_items = list ([]);
							var __iterable0__ = self.tabs;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var tab = __iterable0__ [__index0__];
								menu_items.append (tab.menu_item ());
								tab_items.append (tab.tab_item ());
							}
							return m ('div', m ('form', dict ({'onsubmit': self.search}), m ('div.ui.borderless.menu', m ('div.right.menu', dict ({'style': 'padding-right: 40%'}), m ('div.item', dict ({'style': 'width: 80%'}), m ('div.ui.transparent.icon.input', m ('input[type=text][placeholder=Search...]', dict ({'id': self._searchId})), m ('i.search.icon'))), m ('div.item', m ('input.ui.primary.button[type=submit][value=Search]'))))), m ('div.ui.top.attached.pointing.five.item.menu', menu_items), tab_items);
						});}
					});
					__pragma__ ('<use>' +
						'pylib.server' +
					'</use>')
					__pragma__ ('<all>')
						__all__.AnonMsgs = AnonMsgs;
						__all__.AnonMsgsTable = AnonMsgsTable;
						__all__.DIDField = DIDField;
						__all__.DateField = DateField;
						__all__.Entities = Entities;
						__all__.EntitiesTable = EntitiesTable;
						__all__.EpochField = EpochField;
						__all__.Field = Field;
						__all__.FillField = FillField;
						__all__.HIDField = HIDField;
						__all__.IDField = IDField;
						__all__.Issuants = Issuants;
						__all__.MIDField = MIDField;
						__all__.Messages = Messages;
						__all__.OIDField = OIDField;
						__all__.Offers = Offers;
						__all__.Searcher = Searcher;
						__all__.Tab = Tab;
						__all__.Table = Table;
						__all__.TabledTab = TabledTab;
						__all__.Tabs = Tabs;
						__all__.server = server;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'pylib.router', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var inspector = __init__ (__world__.pylib.inspector);
					var Router = __class__ ('Router', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.tabs = inspector.Tabs ();
						});},
						get route () {return __get__ (this, function (self, root) {
							if (typeof root == 'undefined' || (root != null && root .hasOwnProperty ("__kwargtrans__"))) {;
								var root = null;
							};
							if (root === null) {
								var root = document.body;
							}
							m.route (root, '/inspector', dict ({'/inspector': dict ({'render': self.tabs.view})}));
						});}
					});
					__pragma__ ('<use>' +
						'pylib.inspector' +
					'</use>')
					__pragma__ ('<all>')
						__all__.Router = Router;
						__all__.inspector = inspector;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'pylib.server', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var request = function (path) {
						var kwargs = dict ();
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'path': var path = __allkwargs0__ [__attrib0__]; break;
										default: kwargs [__attrib0__] = __allkwargs0__ [__attrib0__];
									}
								}
								delete kwargs.__kwargtrans__;
							}
						}
						else {
						}
						path += '?';
						var __iterable0__ = kwargs.py_items ();
						for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
							var __left0__ = __iterable0__ [__index0__];
							var key = __left0__ [0];
							var value = __left0__ [1];
							path += ((key + '=') + str (value)) + '&';
						}
						var path = path.__getslice__ (0, -(1), 1);
						return m.request (path);
					};
					var Manager = __class__ ('Manager', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.anonMsgs = AnonMessages ();
							self.entities = Entities ();
						});}
					});
					var Entities = __class__ ('Entities', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.agents = list ([]);
							self.things = list ([]);
						});},
						get refreshAgents () {return __get__ (this, function (self) {
							while (len (self.agents)) {
								self.agents.py_pop ();
							}
							return request ('/agent', __kwargtrans__ ({all: true})).then (self._parseAllAgents);
						});},
						get _parseAllAgents () {return __get__ (this, function (self, dids) {
							var promises = list ([]);
							var __iterable0__ = dids;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var did = __iterable0__ [__index0__];
								promises.append (request ('/agent', __kwargtrans__ ({did: did})).then (self._parseOneAgent));
							}
							return Promise.all (promises);
						});},
						get _parseOneAgent () {return __get__ (this, function (self, data) {
							self.agents.append (data);
						});},
						get refreshThings () {return __get__ (this, function (self) {
							while (len (self.things)) {
								self.things.py_pop ();
							}
							return request ('/thing', __kwargtrans__ ({all: true})).then (self._parseAllThings);
						});},
						get _parseAllThings () {return __get__ (this, function (self, dids) {
							var promises = list ([]);
							var __iterable0__ = dids;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var did = __iterable0__ [__index0__];
								promises.append (request ('/thing', __kwargtrans__ ({did: did})).then (self._parseOneThing));
							}
							return Promise.all (promises);
						});},
						get _parseOneThing () {return __get__ (this, function (self, data) {
							self.things.append (data);
						});}
					});
					var AnonMessages = __class__ ('AnonMessages', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.messages = list ([]);
						});},
						get refresh () {return __get__ (this, function (self) {
							while (len (self.messages)) {
								self.messages.py_pop ();
							}
							return request ('/anon', __kwargtrans__ ({all: true})).then (self._parseAll);
						});},
						get _parseAll () {return __get__ (this, function (self, uids) {
							var promises = list ([]);
							var __iterable0__ = uids;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var uid = __iterable0__ [__index0__];
								promises.append (request ('/anon', __kwargtrans__ ({uid: uid})).then (self._parseOne));
							}
							return Promise.all (promises);
						});},
						get _parseOne () {return __get__ (this, function (self, messages) {
							var __iterable0__ = messages;
							for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
								var message = __iterable0__ [__index0__];
								self.messages.append (message);
							}
						});}
					});
					var manager = Manager ();
					__pragma__ ('<all>')
						__all__.AnonMessages = AnonMessages;
						__all__.Entities = Entities;
						__all__.Manager = Manager;
						__all__.manager = manager;
						__all__.request = request;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'tests.test_inspector', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var test = __init__ (__world__.tests.tester).test;
					var inspector = __init__ (__world__.pylib.inspector);
					var router = __init__ (__world__.pylib.router);
					var o = require ('mithril/ospec/ospec');
					var sinon = require ('sinon');
					var Searcher = __class__ ('Searcher', [object], {
						CaseSensitive: __class__ ('CaseSensitive', [object], {
							get beforeEach () {return __get__ (this, function (self) {
								self.searcher = inspector.Searcher ();
							});},
							get setSearch () {return __get__ (this, function (self) {
								self.searcher.setSearch ('"SensITive"');
								o (self.searcher.searchTerm).equals ('SensITive');
								o (self.searcher.caseSensitive).equals (true);
							});},
							get searchBasic () {return __get__ (this, function (self) {
								self.searcher.setSearch ('"Foo"');
								o (self.searcher.search (dict ({'bar': 'foo'}))).equals (false);
								o (self.searcher.search (dict ({'foo': 'bar'}))).equals (false);
								o (self.searcher.search (dict ({'Foo': 'bar'}))).equals (false);
								o (self.searcher.search (dict ({'Bar': 'Foo'}))).equals (true);
							});},
							get searchNested () {return __get__ (this, function (self) {
								self.searcher.setSearch ('"Foo"');
								o (self.searcher.search (dict ({'bar': dict ({'bar': 'foo'})}))).equals (false);
								o (self.searcher.search (dict ({'bar': dict ({'bar': 'Foo'})}))).equals (true);
							});},
							get searchList () {return __get__ (this, function (self) {
								self.searcher.setSearch ('"Foo"');
								o (self.searcher.search (dict ({'foo': list ([0, 1, 'foo', 3])}))).equals (false);
								o (self.searcher.search (dict ({'foo': list ([0, 1, 'Foo', 3])}))).equals (true);
							});},
							get searchListNested () {return __get__ (this, function (self) {
								self.searcher.setSearch ('"Foo"');
								o (self.searcher.search (dict ({'bar': list ([0, 1, dict ({'bar': 'foo'}), list ([3, 'foo', 5]), 6])}))).equals (false);
								o (self.searcher.search (dict ({'bar': list ([0, 1, dict ({'bar': 'foo'}), list ([3, 'Foo', 5]), 6])}))).equals (true);
								o (self.searcher.search (dict ({'bar': list ([0, 1, dict ({'bar': 'Foo'}), list ([3, 'foo', 5]), 6])}))).equals (true);
							});},
							get searchInnerString () {return __get__ (this, function (self) {
								self.searcher.setSearch ('"Foo"');
								o (self.searcher.search (dict ({'foo': 'blah Fblahooblah blah'}))).equals (false);
								o (self.searcher.search (dict ({'foo': 'blah blahFooblah blah'}))).equals (true);
							});}
						}),
						CaseInsensitive: __class__ ('CaseInsensitive', [object], {
							get beforeEach () {return __get__ (this, function (self) {
								self.searcher = inspector.Searcher ();
							});},
							get setSearch () {return __get__ (this, function (self) {
								self.searcher.setSearch ('InSensItive');
								o (self.searcher.searchTerm).equals ('insensitive');
								o (self.searcher.caseSensitive).equals (false);
							});},
							get searchBasic () {return __get__ (this, function (self) {
								self.searcher.setSearch ('Foo');
								o (self.searcher.search (dict ({'bar': 'foo'}))).equals (true);
								o (self.searcher.search (dict ({'foo': 'bar'}))).equals (false);
								o (self.searcher.search (dict ({'Foo': 'bar'}))).equals (false);
								o (self.searcher.search (dict ({'Bar': 'Foo'}))).equals (true);
							});},
							get searchNested () {return __get__ (this, function (self) {
								self.searcher.setSearch ('foo');
								o (self.searcher.search (dict ({'bar': dict ({'bar': 'bar'})}))).equals (false);
								o (self.searcher.search (dict ({'bar': dict ({'bar': 'Foo'})}))).equals (true);
							});},
							get searchList () {return __get__ (this, function (self) {
								self.searcher.setSearch ('foo');
								o (self.searcher.search (dict ({'foo': list ([0, 1, 'bar', 3])}))).equals (false);
								o (self.searcher.search (dict ({'foo': list ([0, 1, 'Foo', 3])}))).equals (true);
							});},
							get searchInnerString () {return __get__ (this, function (self) {
								self.searcher.setSearch ('foo');
								o (self.searcher.search (dict ({'foo': 'blah Fblahooblah blah'}))).equals (false);
								o (self.searcher.search (dict ({'foo': 'blah blahFooblah blah'}))).equals (true);
							});},
							get searchListNested () {return __get__ (this, function (self) {
								self.searcher.setSearch ('foo');
								o (self.searcher.search (dict ({'bar': list ([0, 1, dict ({'bar': 'boo'}), list ([3, 'boo', 5]), 6])}))).equals (false);
								o (self.searcher.search (dict ({'bar': list ([0, 1, dict ({'bar': 'Foo'}), list ([3, 'boo', 5]), 6])}))).equals (true);
								o (self.searcher.search (dict ({'bar': list ([0, 1, dict ({'bar': 'boo'}), list ([3, 'Foo', 5]), 6])}))).equals (true);
							});}
						})
					})
					var Searcher = test (Searcher);
					var TabledTab = __class__ ('TabledTab', [object], {
						_data: list ([dict ({'did': 'did:igo:Qt27fThWoNZsa88VrTkep6H-4HA8tr54sHON1vWl6FE=', 'hid': 'hid:dns:localhost#02', 'signer': 'did:igo:Xq5YqaL6L48pf0fu7IUhL0JRaU2_RxFP0AL43wYn148=#0', 'changed': '2000-01-01T00:00:00+00:00', 'issuants': list ([dict ({'kind': 'dns', 'issuer': 'localhost', 'registered': '2000-01-01T00:00:00+00:00', 'validationURL': 'http://localhost:8080/demo/check'})]), 'data': dict ({'keywords': list (['Canon', 'EOS Rebel T6', '251440']), 'message': 'test message'}), 'keys': list ([dict ({'key': 'dZ74MLZXD-1QHoa73w9pQ9GroAvxqFi2RTZWlkC0raY=', 'kind': 'EdDSA'}), dict ({'key': '0UX5tP24WPEmAbROdXdygGAM3oDcvrqb3foX4EyayYI=', 'kind': 'EdDSA'})])}), dict ({'did': 'other1', 'data': dict ({'message': 'test message'})}), dict ({'did': 'other2', 'data': dict ({'message': 'another message'})})]),
						get before () {return __get__ (this, function (self) {
							self._testServer = sinon.createFakeServer ();
							self._testServer.respondWith ('[]');
							self._testServer.respondImmediately = true;
							window.XMLHttpRequest = XMLHttpRequest;
						});},
						get after () {return __get__ (this, function (self) {
							self._testServer.restore ();
						});},
						get asyncBeforeEach () {return __get__ (this, function (self, done) {
							var r = router.Router ();
							r.route ();
							self.tabs = r.tabs;
							setTimeout (done);
						});},
						get startup () {return __get__ (this, function (self) {
							self.tabs.search ();
							o (self.tabs.searcher.searchTerm).equals ('') ('Start with no search');
							var current = self.tabs.currentTab ();
							o (current.Data_tab).equals (self.tabs.tabs [0].Data_tab);
							o (py_typeof (current)).equals (inspector.Entities) ('First tab is Entities');
						});},
						get _setData () {return __get__ (this, function (self, callback) {
							self.tabs.currentTab ().table._setData (self._data);
							self._redraw (callback);
						});},
						get _redraw () {return __get__ (this, function (self, callback) {
							m.redraw ();
							setTimeout (callback, 50);
						});},
						get _clickRow () {return __get__ (this, function (self, row, callback) {
							jQuery ("[data-tab='entities'].tab.active table > tbody > tr") [row].click ();
							self._redraw (callback);
						});},
						get _clickId () {return __get__ (this, function (self, id, callback) {
							jQuery ('#' + id).click ();
							self._redraw (callback);
						});},
						get asyncBasicSearch () {return __get__ (this, function (self, done, timeout) {
							timeout (200);
							jQuery ('#' + self.tabs._searchId).val ('test message');
							self.tabs.search ();
							o (self.tabs.searcher.searchTerm).equals ('test message') ('Search term set properly');
							var f1 = function () {
								var rows = jQuery ("[data-tab='entities'].tab.active table > tbody > tr");
								o (rows.length).equals (2) ('Two search results found');
								var f2 = function () {
									var rows = jQuery ("[data-tab='entities'].tab.active table > tbody > tr");
									o (rows.length).equals (1) ('Only one entry in table');
									var td = rows.find ('td');
									o (td.length).equals (1) ('Entry only has one piece of data');
									o (td.text ()).equals (inspector.Table.no_results_text);
									done ();
								};
								jQuery ('#' + self.tabs._searchId).val ('not in test data');
								self.tabs.search ();
								self._redraw (f2);
							};
							self._setData (f1);
						});},
						get asyncSelectRows () {return __get__ (this, function (self, done, timeout) {
							timeout (200);
							var f1 = function () {
								var f2 = function () {
									var tab = self.tabs.currentTab ();
									var expected = tab.table._stringify (self._data [0]);
									var actual = jQuery ('#' + tab._detailsId).text ();
									o (actual).equals (expected) ('Details of row 0 are shown');
									o (jQuery ('#' + tab._copiedId).text ()).equals ('') ('Copy is empty');
									var f3 = function () {
										var expected = tab.table._stringify (self._data [1]);
										var actual = jQuery ('#' + tab._detailsId).text ();
										o (actual).equals (expected) ('Details of row 1 are shown');
										o (jQuery ('#' + tab._copiedId).text ()).equals ('') ('Copy is empty');
										done ();
									};
									self._clickRow (1, f3);
								};
								self._clickRow (0, f2);
							};
							self._setData (f1);
						});},
						get asyncDetailsCopy () {return __get__ (this, function (self, done, timeout) {
							timeout (400);
							var f1 = function () {
								var f2 = function () {
									var tab = self.tabs.currentTab ();
									var f3 = function () {
										var expected = tab.table._stringify (self._data [0]);
										o (jQuery ('#' + tab._detailsId).text ()).equals (expected) ('Details of row 0 are shown');
										o (jQuery ('#' + tab._copiedId).text ()).equals (expected) ('Details are copied');
										var f4 = function () {
											o (jQuery ('#' + tab._detailsId).text ()).equals (expected) ('Details are still shown');
											o (jQuery ('#' + tab._copiedId).text ()).equals ('') ('Copy is now empty');
											done ();
										};
										self._clickId (tab._clearButtonId, f4);
									};
									self._clickId (tab._copyButtonId, f3);
								};
								self._clickRow (0, f2);
							};
							self._setData (f1);
						});}
					})
					var TabledTab = test (TabledTab);
					__pragma__ ('<use>' +
						'pylib.inspector' +
						'pylib.router' +
						'tests.tester' +
					'</use>')
					__pragma__ ('<all>')
						__all__.Searcher = Searcher;
						__all__.TabledTab = TabledTab;
						__all__.inspector = inspector;
						__all__.o = o;
						__all__.router = router;
						__all__.sinon = sinon;
						__all__.test = test;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'tests.test_server', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var test = __init__ (__world__.tests.tester).test;
					var server = __init__ (__world__.pylib.server);
					var o = require ('mithril/ospec/ospec');
					var sinon = require ('sinon');
					var Server = __class__ ('Server', [object], {
						get beforeEach () {return __get__ (this, function (self) {
							self.testServer = sinon.createFakeServer ();
							window.XMLHttpRequest = global.XMLHttpRequest;
						});},
						get afterEach () {return __get__ (this, function (self) {
							self.testServer.restore ();
						});},
						get _respond () {return __get__ (this, function (self, request, response) {
							request.respond (200, dict ({'Content-Type': 'application/json'}), JSON.stringify (response));
						});},
						get basicRequest () {return __get__ (this, function (self) {
							var endpoint = '/foo';
							var verify = function (request) {
								o (request.method).equals ('GET');
								o (request.url).equals (endpoint);
								request.respond (200);
							};
							self.testServer.respondWith (verify);
							server.request (endpoint);
							self.testServer.respond ();
						});},
						get queryRequest () {return __get__ (this, function (self) {
							var endpoint = '/foo';
							var full_path = '/foo?one=1&two=2';
							var verify = function (request) {
								o (request.method).equals ('GET');
								o (request.url).equals (full_path);
								request.respond (200);
							};
							self.testServer.respondWith (verify);
							server.request (endpoint, __kwargtrans__ ({one: 1, two: 2}));
							self.testServer.respond ();
						});},
						get asyncAnonMessages () {return __get__ (this, function (self, done) {
							var manager = server.Manager ();
							o (len (manager.anonMsgs.messages)).equals (0) ('No messages at start');
							var all_ = function (request) {
								self._respond (request, list (['uid1', 'uid2']));
							};
							self.testServer.respondWith ('/anon?all=true', all_);
							var mContent = 'EjRWeBI0Vng=';
							var mDate = '2017-10-03T20:55:45.186082+00:00';
							var mCreate = 1507064140186082;
							var mExpire = 1507150540186082;
							var uid1 = function (request) {
								self._respond (request, list ([dict ({'create': mCreate, 'expire': mExpire, 'anon': dict ({'uid': 'uid1', 'content': mContent, 'date': mDate})})]));
							};
							self.testServer.respondWith ('/anon?uid=uid1', uid1);
							var uid2 = function (request) {
								self._respond (request, list ([]));
							};
							self.testServer.respondWith ('/anon?uid=uid2', uid2);
							var f1 = function () {
								o (len (manager.anonMsgs.messages)).equals (1) ('Only one actual message found');
								var message = manager.anonMsgs.messages [0];
								o (message.anon.uid).equals ('uid1');
								o (message.anon.content).equals (mContent);
								o (message.anon.date).equals (mDate);
								o (message.create).equals (mCreate);
								o (message.expire).equals (mExpire);
								done ();
							};
							self.testServer.autoRespond = true;
							manager.anonMsgs.refresh ().then (f1);
						});}
					})
					var Server = test (Server);
					__pragma__ ('<use>' +
						'pylib.server' +
						'tests.tester' +
					'</use>')
					__pragma__ ('<all>')
						__all__.Server = Server;
						__all__.o = o;
						__all__.server = server;
						__all__.sinon = sinon;
						__all__.test = test;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'tests.tester', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var jsdom = require ('jsdom');
					global.window = new jsdom.JSDOM ().window;
					global.document = window.document;
					global.XMLHttpRequest = window.XMLHttpRequest;
					global.jQuery = require ('jquery');
					global.m = require ('mithril');
					require ('../../semantic/dist/semantic');
					var o = require ('mithril/ospec/ospec');
					var test = function (Cls) {
						var Wrapper = __class__ ('Wrapper', [object], {
							get __init__ () {return __get__ (this, function (self) {
								var original = Cls ();
								var dospec = function () {
									var funcs = list ([]);
									for (var key in original) {
										if (key.startswith ('_')) {
											continue;
										}
										var obj = original [key];
										if (key [0].isupper ()) {
											test (obj);
											continue;
										}
										if (key.startswith ('async')) {
											var makeScope = function (fun) {
												return (function __lambda__ (done, timeout) {
													return fun (done, timeout);
												});
											};
											var obj = makeScope (obj);
											var key = key.__getslice__ (len ('async'), null, 1);
										}
										if (__in__ (key, list (['beforeEach', 'BeforeEach']))) {
											o.beforeEach (obj);
										}
										else if (__in__ (key, list (['before', 'Before']))) {
											o.before (obj);
										}
										else if (__in__ (key, list (['afterEach', 'AfterEach']))) {
											o.afterEach (obj);
										}
										else if (__in__ (key, list (['after', 'After']))) {
											o.after (obj);
										}
										else {
											funcs.append (tuple ([key, obj]));
										}
									}
									var __iterable0__ = funcs;
									for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
										var __left0__ = __iterable0__ [__index0__];
										var py_name = __left0__ [0];
										var func = __left0__ [1];
										o (py_name, func);
									}
								};
								o.spec (Cls.__name__, dospec);
							});}
						});
						Wrapper ();
						return Wrapper;
					};
					__pragma__ ('<all>')
						__all__.jsdom = jsdom;
						__all__.o = o;
						__all__.test = test;
					__pragma__ ('</all>')
				}
			}
		}
	);
	(function () {
		var test_inspector = __init__ (__world__.tests.test_inspector);
		var test_server = __init__ (__world__.tests.test_server);
		__pragma__ ('<use>' +
			'tests.test_inspector' +
			'tests.test_server' +
		'</use>')
		__pragma__ ('<all>')
			__all__.test_inspector = test_inspector;
			__all__.test_server = test_server;
		__pragma__ ('</all>')
	}) ();
   return __all__;
}
tests ();