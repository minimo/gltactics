/*
The MIT License (MIT)

Copyright (c) 2015 daishi_hmr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/*
 * delegateuril.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");

    phina.define("phina.three.DelegateUtil", {
        init: function(type) {
            this.type = type;
        },
        property: function(name, threeProperty) {
            if (threeProperty) {
                this.type.prototype.accessor(name, {
                    get: function() {
                        return this.threeObject[threeProperty][name];
                    },
                    set: function(v) {
                        this.threeObject[threeProperty][name] = v;
                    }
                });
            } else {
                this.type.prototype.accessor(name, {
                    get: function() {
                        return this.threeObject[name];
                    },
                    set: function(v) {
                        this.threeObject[name] = v;
                    }
                });
            }

            this.type.method(createSetterName(name), function(v) {
                this[name] = v;
                return this;
            });
        },
        method: function(name, returnThis, threeProperty) {
            if (threeProperty) {
                this.type.method(name, function() {
                    var r = this.threeObject[threeProperty][name].apply(this.threeObject[threeProperty], arguments);
                    if (returnThis) {
                        return this;
                    } else {
                        return r;
                    }
                });
            } else {
                this.type.method(name, function() {
                    var r = this.threeObject[name].apply(this.threeObject, arguments);
                    if (returnThis) {
                        return this;
                    } else {
                        return r;
                    }
                });
            }
        },
    });

    function createSetterName(propertyName) {
        return "set" + propertyName[0].toUpperCase() + propertyName.substring(1);
    }
});

/*
 * threeelement.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");

    phina.define("phina.three.ThreeElement", {
        superClass: "phina.app.Element",

        /**
         * @constructor phina.three.ThreeElement
         * @param {THREE.Object3D} threeObject
         * @extends {phina.app.Element}
         * @mixes THREE.Object3D
         *
         * @property {number} x
         * @property {number} y
         * @property {number} z
         * @property {number} scaleX
         * @property {number} scaleY
         * @property {number} scaleZ
         * @property {number} rotationX
         * @property {number} rotationY
         * @property {number} rotationZ
         * @property {THREE.Vector3} forwardVector readonly
         * @property {THREE.Vector3} sidewardVector readonly
         * @property {THREE.Vector3} upwardVector readonly
         */
        init: function(threeObject) {
            this.superInit();

            this.threeObject = threeObject || new THREE.Object3D();
        },

        addChild: function(child) {
            if (child.parent) child.remove();
            child.parent = this;
            this.children.push(child);

            if (child instanceof phina.three.ThreeElement) {
                this.threeObject.add(child.threeObject);
            }
            child.flare('added');

            return child;
        },

        removeChild: function(child) {
            var index = this.children.indexOf(child);
            if (index != -1) {
                this.children.splice(index, 1);

                if (child instanceof phina.three.ThreeElement) {
                    this.threeObject.remove(child.threeObject);
                }
                child.flare('removed');
            }
        },

        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} x
         * @param {number} y
         * @param {number} z
         */
        setPosition: function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        },

        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} delta
         */
        ahead: function(delta) {
            this.threeObject.position.add(this.forwardVector.multiplyScalar(delta));
            return this;
        },
        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} delta
         */
        sideStep: function(delta) {
            this.threeObject.position.add(this.sidewardVector.multiplyScalar(delta));
            return this;
        },
        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} delta
         */
        elevate: function(delta) {
            this.threeObject.position.add(this.upwardVector.multiplyScalar(delta));
            return this;
        },

        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} x
         * @param {number} y
         * @param {number} z
         */
        setRotation: function(x, y, z) {
            this.rotationX = x;
            this.rotationY = y;
            this.rotationZ = z;
            return this;
        },
        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} x
         */
        setRotationX: function(x) {
            this.rotationX = x;
            return this;
        },
        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} y
         */
        setRotationY: function(y) {
            this.rotationY = y;
            return this;
        },
        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} z
         */
        setRotationZ: function(z) {
            this.rotationZ = z;
            return this;
        },

        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} degree
         */
        rotatePitch: function(degree) {
            var q = tempQuat.setFromAxisAngle(V3_RIGHT, degree * Math.DEG_TO_RAD);
            this.quaternion.multiply(q);
            return this;
        },
        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} degree
         */
        rotateYaw: function(degree) {
            var q = tempQuat.setFromAxisAngle(V3_UP, degree * Math.DEG_TO_RAD);
            this.quaternion.multiply(q);
            return this;
        },
        /**
         * @method
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} degree
         */
        rotateRoll: function(degree) {
            var q = tempQuat.setFromAxisAngle(V3_FORWARD, degree * Math.DEG_TO_RAD);
            this.quaternion.multiply(q);
            return this;
        },

        /**
         * @memberOf phina.three.ThreeElement.prototype
         * @param {number} x
         * @param {number=} y
         * @param {number=} z
         */
        setScale: function(x, y, z) {
            if (arguments.length === 1) {
                y = x;
                z = x;
            }
            this.scaleX = x;
            this.scaleY = y;
            this.scaleZ = z;
            return this;
        },

        show: function() {
            this.visible = true;
            return this;
        },
        hide: function() {
            this.visible = false;
            return this;
        },
    });

    var V3_RIGHT = new THREE.Vector3(1, 0, 0);
    var V3_UP = new THREE.Vector3(0, 1, 0);
    var V3_FORWARD = new THREE.Vector3(0, 0, 1);
    var tempQuat = new THREE.Quaternion();

    var delegater = phina.three.DelegateUtil(phina.three.ThreeElement);

    delegater.property("id");
    delegater.property("uuid");
    delegater.property("name");

    phina.three.ThreeElement.prototype.accessor("position", {
        get: function() {
            return this.threeObject.position;
        },
        set: function(v) {
            this.threeObject.position = v;
        }
    });
    delegater.property("x", "position");
    delegater.property("y", "position");
    delegater.property("z", "position");

    phina.three.ThreeElement.prototype.accessor("scale", {
        get: function() {
            return this.threeObject.scale;
        },
        set: function(v) {
            this.threeObject.scale = v;
        }
    });
    phina.three.ThreeElement.prototype.accessor("scaleX", {
        get: function() {
            return this.threeObject.scale.x;
        },
        set: function(v) {
            this.threeObject.scale.x = v;
        }
    });
    phina.three.ThreeElement.prototype.accessor("scaleY", {
        get: function() {
            return this.threeObject.scale.y;
        },
        set: function(v) {
            this.threeObject.scale.y = v;
        }
    });
    phina.three.ThreeElement.prototype.accessor("scaleZ", {
        get: function() {
            return this.threeObject.scale.z;
        },
        set: function(v) {
            this.threeObject.scale.z = v;
        }
    });
    phina.three.ThreeElement.prototype.accessor("rotation", {
        get: function() {
            return this.threeObject.rotation;
        },
        set: function(v) {
            this.threeObject.rotation = v;
        }
    });
    phina.three.ThreeElement.prototype.accessor("rotationX", {
        get: function() {
            return this.threeObject.rotation.x * Math.RAD_TO_DEG;
        },
        set: function(v) {
            this.threeObject.rotation.x = v * Math.DEG_TO_RAD;
        }
    });
    phina.three.ThreeElement.prototype.accessor("rotationY", {
        get: function() {
            return this.threeObject.rotation.y * Math.RAD_TO_DEG;
        },
        set: function(v) {
            this.threeObject.rotation.y = v * Math.DEG_TO_RAD;
        }
    });
    phina.three.ThreeElement.prototype.accessor("rotationZ", {
        get: function() {
            return this.threeObject.rotation.z * Math.RAD_TO_DEG;
        },
        set: function(v) {
            this.threeObject.rotation.z = v * Math.DEG_TO_RAD;
        }
    });

    phina.three.ThreeElement.prototype.getter("forwardVector", function() {
        if (this._forwardVector == null) this._forwardVector = new THREE.Vector3();
        this._forwardVector.set(0, 0, 1);
        this._forwardVector.applyQuaternion(this.quaternion);
        return this._forwardVector;
    });
    phina.three.ThreeElement.prototype.getter("sidewardVector", function() {
        if (this._sidewardVector == null) this._sidewardVector = new THREE.Vector3();
        this._sidewardVector.set(1, 0, 0);
        this._sidewardVector.applyQuaternion(this.quaternion);
        return this._sidewardVector;
    });
    phina.three.ThreeElement.prototype.getter("upwardVector", function() {
        if (this._upVector == null) this._upVector = new THREE.Vector3();
        this._upVector.set(0, 1, 0);
        this._upVector.applyQuaternion(this.quaternion);
        return this._upVector;
    });
    
    delegater.property("up");
    delegater.property("quaternion");
    delegater.property("visible");
    delegater.property("castShadow");
    delegater.property("receiveShadow");
    delegater.property("frustumCulled");
    delegater.property("matrixAutoUpdate");
    delegater.property("matrixWorldNeedsUpdate");
    delegater.property("rotationAutoUpdate");
    delegater.property("userData");
    delegater.property("matrixWorld");

    delegater.method("applyMatrix", true);
    delegater.method("translateX", true);
    delegater.method("translateY", true);
    delegater.method("translateZ", true);
    delegater.method("localToWorld");
    delegater.method("worldToLocal");
    delegater.method("lookAt", true);
    delegater.method("traverse", true);
    delegater.method("traverseVisible", true);
    delegater.method("traverseAncestors", true);
    delegater.method("updateMatrix", true);
    delegater.method("updateMatrixWorld", true);
    delegater.method("getObjectByName");
    delegater.method("rotateOnAxis", true);

    phina.three.ThreeElement.prototype.localToGlobal = phina.three.ThreeElement.prototype.localToWorld;
    phina.three.ThreeElement.prototype.globalToLocal = phina.three.ThreeElement.prototype.worldToLocal;

});

/*
 * mesh.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");
    // require("./threeelement");

    phina.define("phina.three.Mesh", {
        superClass: "phina.three.ThreeElement",

        /**
         * @constructor phina.three.Mesh
         * @param {THREE.Mesh} mesh
         * @extends {phina.three.ThreeElement}
         * @mixes THREE.Mesh
         */
        init: function(mesh) {
            if (typeof(mesh) === "string") {
                var asset = phina.asset.AssetManager.get("mqo", mesh);
                if (asset) {
                    var meshes = asset.getMesh();
                    this.superInit(meshes[0]);
                    for (var i = 1; i < meshes.length; i++) {
                        phina.three.Mesh(meshes[i]).addChildTo(this);
                    }
                } else {
                    var asset = phina.asset.AssetManager.get("mmd", mesh);
                    if (asset) {
                        var mesh = asset.getMesh();
                        this.superInit(mesh);

                        this._animation = new THREE.Animation(mesh, mesh.geometry.animation);
                        this._animation.play();
                        this._morphAnimation = new THREE.MorphAnimation2(mesh, mesh.geometry.morphAnimation);
                        this._morphAnimation.play();

                        this._ikSolver = phina.three.MMD.CCDIKSolver(mesh);
                        this.on('enterframe', function(e) {
                            this._ikSolver.update();
                        }.bind(this));
                    } else {
                        console.error("アセット'{0}'がないよ".format(mesh));
                    }
                }
            } else if (mesh instanceof THREE.Mesh) {
                this.superInit(mesh);
            } else if (mesh instanceof THREE.Geometry) {
                if (arguments.length >= 2) {
                    this.superInit(new THREE.Mesh(mesh, arguments[1]));
                } else {
                    this.superInit(new THREE.Mesh(mesh));
                }
            } else {
               this.superInit(new THREE.Mesh());
            }
        },

        playAnimation: function(startTime, weight) {
            if (this._animation && this._morphAnimation) {
                this._animation.play(startTime, weight);
                this._morphAnimation.play(startTime);
            }
        },

        stopAnimation: function() {
            if (this._animation && this._morphAnimation) {
                this._animation.stop();
                this._morphAnimation.stop();
            }
        },
    });

    var delegater = phina.three.DelegateUtil(phina.three.Mesh);

    /**
     * @method
     * @memberOf phina.three.Mesh.prototype
     * @param {THREE.Geometry} geometry
     * @returns this
     */
    function setGeometry() {}
    delegater.property("geometry");

    /**
     * @method
     * @memberOf phina.three.Mesh.prototype
     * @param {THREE.Material} material
     * @returns this
     */
    function setMaterial() {}
    delegater.property("material");

    delegater.method("getMorphTargetIndexByName", true);
    delegater.method("updateMorphTargets", true);

});

/*
 * camera.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");
    // require("./threeelement");

    phina.define("phina.three.Camera", {
        superClass: "phina.three.ThreeElement",

        init: function() {
            this.superInit(new THREE.PerspectiveCamera(45, 1, 1, 20000));
        },

        isInSight: function(obj) {
            tempVector.setFromMatrixPosition(obj.matrixWorld).project(this);
            return -1 <= tempVector.x && tempVector.x <= 1 && -1 <= tempVector.y && tempVector.y <= 1;
        },
    });

    var tempVector = new THREE.Vector3();

    var delegater = phina.three.DelegateUtil(phina.three.Camera);

    delegater.property("matrixWorldInverse");
    delegater.property("projectionMatrix");
    phina.three.Camera.prototype.accessor("fov", {
        get: function() {
            return this.threeObject.fov;
        },
        set: function(v) {
            this.threeObject.fov = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.Camera.method("setFov", function(v) {
        this.fov = v;
        return this;
    });

    phina.three.Camera.prototype.accessor("aspect", {
        get: function() {
            return this.threeObject.aspect;
        },
        set: function(v) {
            this.threeObject.aspect = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.Camera.method("setAspect", function(v) {
        this.aspect = v;
        return this;
    });

    phina.three.Camera.prototype.accessor("near", {
        get: function() {
            return this.threeObject.near;
        },
        set: function(v) {
            this.threeObject.near = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.Camera.method("setNear", function(v) {
        this.near = v;
        return this;
    });

    phina.three.Camera.prototype.accessor("far", {
        get: function() {
            return this.threeObject.far;
        },
        set: function(v) {
            this.threeObject.far = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.Camera.method("setFar", function(v) {
        this.far = v;
        return this;
    });

});

/*
 * othrocamera.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./threeelement");

    phina.define("phina.three.OrthoCamera", {
        superClass: "phina.three.ThreeElement",

        init: function() {
            this.superInit(new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10000));
        },
    });

    phina.three.OrthoCamera.prototype.accessor("left", {
        get: function() {
            return this.threeObject.left;
        },
        set: function(v) {
            this.threeObject.left = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.OrthoCamera.prototype.accessor("right", {
        get: function() {
            return this.threeObject.right;
        },
        set: function(v) {
            this.threeObject.right = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.OrthoCamera.prototype.accessor("top", {
        get: function() {
            return this.threeObject.top;
        },
        set: function(v) {
            this.threeObject.top = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.OrthoCamera.prototype.accessor("bottom", {
        get: function() {
            return this.threeObject.bottom;
        },
        set: function(v) {
            this.threeObject.bottom = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.OrthoCamera.prototype.accessor("near", {
        get: function() {
            return this.threeObject.near;
        },
        set: function(v) {
            this.threeObject.near = v;
            this.threeObject.updateProjectionMatrix();
        },
    });
    phina.three.OrthoCamera.prototype.accessor("far", {
        get: function() {
            return this.threeObject.far;
        },
        set: function(v) {
            this.threeObject.far = v;
            this.threeObject.updateProjectionMatrix();
        },
    });

});

/*
 * shape.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./mesh");

    phina.define("phina.three.PlaneMesh", {
        superClass: "phina.three.Mesh",

        init: function(geometryParam, materialParam) {
            geometryParam = {}.$extend(phina.three.PlaneMesh.DEFAULT_GEOMETRY_PARAM, geometryParam);
            materialParam = {}.$extend(phina.three.PlaneMesh.DEFAULT_MATERIAL_PARAM, materialParam);
            var geo = new THREE.PlaneGeometry(geometryParam.width, geometryParam.height, geometryParam.widthSegments, geometryParam.heightSegments);
            var mat = new THREE.MeshPhongMaterial(materialParam);
            this.superInit(new THREE.Mesh(geo, mat));
        },
    });
    phina.three.PlaneMesh.DEFAULT_GEOMETRY_PARAM = {
        width: 1,
        height: 1,
        widthSegments: 1,
        heightSegments: 1,
    };
    phina.three.PlaneMesh.DEFAULT_MATERIAL_PARAM = {
        color: 0xffffff,
    };

    phina.define("phina.three.BoxMesh", {
        superClass: "phina.three.Mesh",

        init: function(geometryParam, materialParam) {
            geometryParam = {}.$extend(phina.three.BoxMesh.DEFAULT_GEOMETRY_PARAM, geometryParam);
            materialParam = {}.$extend(phina.three.BoxMesh.DEFAULT_MATERIAL_PARAM, materialParam);
            var geo = new THREE.BoxGeometry(geometryParam.width, geometryParam.height, geometryParam.depth, geometryParam.widthSegments, geometryParam.heightSegments, geometryParam.depthSegments);
            var mat = new THREE.MeshPhongMaterial(materialParam);
            this.superInit(new THREE.Mesh(geo, mat));
        },
    });
    phina.three.BoxMesh.DEFAULT_GEOMETRY_PARAM = {
        width: 1,
        height: 1,
        depth: 1,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1,
    };
    phina.three.BoxMesh.DEFAULT_MATERIAL_PARAM = {
        color: 0xffffff,
    };

});

/*
 * sprite.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./threeelement");

    phina.define("phina.three.Sprite", {
        superClass: "phina.three.ThreeElement",

        init: function(image, xCellSize, yCellSize) {

            var imageName = null;
            var spriteMaterial = null;

            if (typeof(image) === "string") {
                imageName = image;
                spriteMaterial = phina.three.Sprite.materialCache[image];
                if (!spriteMaterial) {
                    image = phina.asset.Manager.get(image);
                    if (!image) {
                        console.error("アセット{0}がないよ".format(image));
                    }
                }
            } else {
                if (!image.id) {
                    image.id = THREE.Math.generateUUID();
                }
                imageName = image.id;
            }

            if (!spriteMaterial) {
                var texture = new THREE.Texture(image.element);
                texture.needsUpdate = true;
                // texture.sourceAssetName = imageName;

                spriteMaterial = new THREE.SpriteMaterial({
                    map: texture,
                    color: 0xffffff,
                    fog: true,
                });

                phina.three.Sprite.materialCache[imageName] = spriteMaterial;
            }

            xCellSize = xCellSize || 1;
            yCellSize = yCellSize || 1;

            this.superInit(new THREE.Sprite(spriteMaterial));
        },
    });

    phina.three.Sprite.materialCache = {};

});

/*
 * texture.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");

    phina.three = phina.three || {};

    phina.three.Texture = function(image, mapping) {
        if (typeof image === "string") {
            image = phina.asset.Manager.get(image).element;
        } else if (image instanceof phina.graphics.Canvas || image instanceof phina.asset.Texture) {
            image = image.element;
        }

        var texture = new THREE.Texture(image, mapping);
        texture.needsUpdate = true;
        return texture;
    };
});

/*
 * scene.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./threeelement");
    // require("./camera");
    // require("./ambientlight");
    // require("./directionallight");

    phina.define("phina.three.Scene", {
        superClass: "phina.app.Scene",

        two: null,
        three: null,

        effectComposer: null,

        /**
         * @constructor phina.three.Scene
         * @extends {phina.app.Scene}
         * @mixes THREE.Scene
         *
         * @property {THREE.PerspectiveCamera} camera
         * @property {THREE.DirectionalLight} directionalLight
         * @property {THREE.AmbientLight} ambientLight
         * @property {THREE.EffectComposer} effectComposer
         * @property {THREE.Color} fogColor
         * @property {number} fogNear
         * @property {number} fogFar
         * @property {Object} two
         * @property {Object} three
         */
        init: function() {
            this.superInit();
            this.two = this;
            this.three = phina.three.Scene.Three();

            // TODO どう扱うか
            this.effectComposer = null;

            this.on("enter", function(e) {
                this.camera.aspect = e.app.width / e.app.height;
            });
        },

        render: function(renderer) {
            if (this.effectComposer && this.effectComposer.passes.length > 1) {
                this.effectComposer.render();
            } else {
                renderer.render(this.three.scene, this.three.camera.threeObject);
            }
        },

        addChild: function(child) {
            if (child instanceof phina.three.ThreeElement) {
                this.three.addChild(child);
            } else {
                phina.app.Scene.prototype.addChild.call(this, child);
            }
        },

        removeChild: function(child) {
            if (child instanceof phina.three.ThreeElement) {
                this.three.removeChild(child);
            } else {
                phina.app.Scene.prototype.removeChild.call(this, child);
            }
        },
        
        enableEffectComposer: function() {
            if (THREE.EffectComposer && THREE.RenderPass) {

                var renderTarget = new THREE.WebGLRenderTarget(this.app.width, this.app.height, {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    format: THREE.RGBFormat,
                    stencilBuffer: false,
                });
                var renderPass = new THREE.RenderPass(this.three.scene, this.three.camera.threeObject);

                this.effectComposer = new THREE.EffectComposer(this.app.threeRenderer, renderTarget);
                this.effectComposer.addPass(renderPass);

                return true;
            } else {
                return false;
            }
        },
    });
    phina.three.Scene.prototype.accessor("camera", {
        get: function() {
            return this.three.camera;
        },
        set: function(v) {
            this.three.camera = v;
        },
    });
    phina.three.Scene.prototype.getCamera = function() { return this.camera };
    phina.three.Scene.prototype.setCamera = function(v) { this.camera = v; return this };

    phina.three.Scene.prototype.accessor("ambientLight", {
        get: function() {
            return this.three.ambientLight;
        },
        set: function(v) {
            this.three.ambientLight = v;
        },
    });
    phina.three.Scene.prototype.getAmbientLight = function() { return this.ambientLight };
    phina.three.Scene.prototype.setAmbientLight = function(v) { this.ambientLight = v; return this };

    phina.three.Scene.prototype.accessor("directionalLight", {
        get: function() {
            return this.three.directionalLight;
        },
        set: function(v) {
            this.three.directionalLight = v;
        },
    });
    phina.three.Scene.prototype.getDirectionalLight = function() { return this.directionalLight };
    phina.three.Scene.prototype.setDirectionalLight = function(v) { this.directionalLight = v; return this };

    phina.three.Scene.prototype.accessor("fog", {
        get: function() {
            return this.three.scene.fog;
        },
        set: function(v) {
            this.three.scene.fog = v;
        },
    });
    phina.three.Scene.prototype.isFog = function() { return this.fog };
    phina.three.Scene.prototype.setFog = function(v) { this.fog = v; return this };

    phina.three.Scene.prototype.accessor("fogColor", {
        get: function() {
            return this.three.scene.fog.color;
        },
        set: function(v) {
            this.three.scene.fog.color = v;
        },
    });
    phina.three.Scene.prototype.getFogColor = function() { return this.fogColor };
    phina.three.Scene.prototype.setFogColor = function(v) { this.fogColor = v; return this };

    phina.three.Scene.prototype.accessor("fogNear", {
        get: function() {
            return this.three.scene.fog.near;
        },
        set: function(v) {
            this.three.scene.fog.near = v;
        },
    });
    phina.three.Scene.prototype.getFogNear = function() { return this.fogNear };
    phina.three.Scene.prototype.setFogNear = function(v) { this.fogNear = v; return this };

    phina.three.Scene.prototype.accessor("fogFar", {
        get: function() {
            return this.three.scene.fog.far;
        },
        set: function(v) {
            this.three.scene.fog.far = v;
        },
    });
    phina.three.Scene.prototype.getFogFar = function() { return this.fogFar };
    phina.three.Scene.prototype.setFogFar = function(v) { this.fogFar = v; return this };

    phina.three.Scene.prototype.accessor("overrideMaterial", {
        get: function() {
            return this.three.scene.overrideMaterial;
        },
        set: function(v) {
            this.three.scene.overrideMaterial = v;
        },
    });
    phina.three.Scene.prototype.getOverrideMaterial = function() { return this.overrideMaterial };
    phina.three.Scene.prototype.setOverrideMaterial = function(v) { this.overrideMaterial = v; return this };

    phina.three.Scene.prototype.accessor("autoUpdate", {
        get: function() {
            return this.three.scene.autoUpdate;
        },
        set: function(v) {
            this.three.scene.autoUpdate = v;
        },
    });
    phina.three.Scene.prototype.isAutoUpdate = function() { return this.autoUpdate };
    phina.three.Scene.prototype.setAutoUpdate = function(v) { this.autoUpdate = v; return this };

    phina.define("phina.three.Scene.Three", {
        superClass: "phina.three.ThreeElement",

        init: function() {
            this.superInit(new THREE.Scene());

            this.scene = this.threeObject;
            this.scene.fog = new THREE.Fog(0xffffff, 1000, 5000);

            this.camera = phina.three.Camera();
            this.camera.z = 7;

            this.ambientLight = phina.three.AmbientLight(0x888888)
                .addChildTo(this);

            this.directionalLight = phina.three.DirectionalLight(0xffffff, 1)
                .setPosition(1, 1, 1)
                .addChildTo(this);
        },
    });
});

/** @namespace */
var phina = phina || {};
/** @namespace */
phina.three = phina.three || {};

/*
 * hybridapp.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./scene");
    
    phina.define("phina.three.Application", {
        superClass: "phina.display.CanvasApp",

        threeRenderer: null,
        threeCanvas: null,

        /**
         * @constructor phina.three.Application
         * @param {HTMLCanvasElement|String} canvas2d canvas element or id for draw 2d graphics
         * @param {HTMLCanvasElement|String} canvas3d canvas element or id for draw 3d graphics
         * @extends {phina.display.CanvasApp}
         *
         * @property {THREE.WebGLRenderer} threeRenderer
         * @property {HTMLCanvasElement} threeCanvas
         */
        init: function(canvas2d, canvas3d) {
            this.superInit(canvas2d);
            this.setupThree(canvas3d);
            this.background = "transparent";

            this.replaceScene(phina.three.Scene())
        },

        /**
         * @memberOf phina.three.Application.prototype
         * @private
         */
        setupThree: function(canvas3d) {
            var param = {
                antialias: true,
            };
            if (canvas3d) {
                if (canvas3d instanceof HTMLCanvasElement) {
                    param.canvas = canvas3d;
                } else if (typeof canvas3d === "string") {
                    param.canvas = document.querySelector(canvas3d);
                }
            }
            this.threeRenderer = new THREE.WebGLRenderer(param);
            this.threeRenderer.setClearColor("0x000000");

            // if (this.element.parentNode) {
            //     this.element.parentNode.insertBefore(this.threeRenderer.domElement, this.element);
            // } else {
            //     window.document.body.appendChild(this.threeRenderer.domElement);
            // }

            this.threeCanvas = this.threeRenderer.domElement;
        },

        fitWindow: function(everFlag) {
            var _fitFunc = function() {
                everFlag = everFlag === undefined ? true : everFlag;
                var e = this.threeCanvas;
                var s = e.style;

                s.position = "absolute";
                s.margin = "auto";
                s.left = "0px";
                s.top = "0px";
                s.bottom = "0px";
                s.right = "0px";

                var rateWidth = e.width / window.innerWidth;
                var rateHeight = e.height / window.innerHeight;
                var rate = e.height / e.width;

                if (rateWidth > rateHeight) {
                    s.width = innerWidth + "px";
                    s.height = innerWidth * rate + "px";
                } else {
                    s.width = innerHeight / rate + "px";
                    s.height = innerHeight + "px";
                }
            }.bind(this);

            // 一度実行しておく
            _fitFunc();
            // リサイズ時のリスナとして登録しておく
            if (everFlag) {
                window.addEventListener("resize", _fitFunc, false);
            }

            return phina.display.CanvasApp.prototype.fitWindow.call(this, everFlag);
        },

        _update: function() {
            phina.app.CanvasApp.prototype._update.call(this);
            var scene = this.currentScene;
            if (this.awake && scene instanceof phina.three.Scene) {
                this.updater.update(scene.three.camera);
                this.updater.update(scene.three);
            }
        },

        _draw: function() {
            phina.display.CanvasApp.prototype._draw.call(this);
            var scene = this.currentScene;
            if (scene instanceof phina.three.Scene) {
                scene.render(this.threeRenderer);
            }
        },

        resize: function(w, h) {
            this.threeRenderer.setSize(w, h);
            var scene = this.currentScene;
            if (scene instanceof phina.three.Scene) {
                scene.three.camera.aspect = w / h;
            }
            return phina.display.CanvasApp.prototype.resize.call(this, w, h);
        }
    });
});

/*
 * colorconv.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");

    phina.three = phina.three || {};

    phina.three.ColorConverter = {
        hsl: function(h, s, l) {
            if (arguments.length === 1 && typeof(arguments[0]) === "string") {
                var m = arguments[0].split(" ").join("").match(/hsl\((\d+),(\d+)%,(\d+)%\)/);
                if (m) {
                    h = m[1];
                    s = m[2];
                    l = m[3];
                } else {
                    throw new Error("invalid argument " + arguments[0]);
                }
            }
            return new THREE.Color().setHSL(h / 360, s / 100, l / 100).getHex();
        },
    };
});

/*
 * ambientlight.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");
    // require("./threeelement");

    phina.define("phina.three.AmbientLight", {
        superClass: "phina.three.ThreeElement",

        init: function(hex) {
            hex = hex || 0xffffff;
            this.superInit(new THREE.AmbientLight(hex));
        },
    });

    var delegater = phina.three.DelegateUtil(phina.three.AmbientLight);

    delegater.property("color");
});

/*
 * directionallight.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");
    // require("./delegateutil");
    // require("./threeelement");

    phina.define("phina.three.DirectionalLight", {
        superClass: "phina.three.ThreeElement",

        init: function(hex, intensity) {
            hex = hex || 0xffffff;
            intensity = intensity || 1.0;
            this.superInit(new THREE.DirectionalLight(hex, intensity));
        },
    });

    var delegater = phina.three.DelegateUtil(phina.three.DirectionalLight);

    delegater.property("target");
    delegater.property("intensity");
    delegater.property("onlyShadow");
    delegater.property("shadowCameraNear");
    delegater.property("shadowCameraFar");
    delegater.property("shadowCameraLeft");
    delegater.property("shadowCameraRight");
    delegater.property("shadowCameraTop");
    delegater.property("shadowCameraBottom");
    delegater.property("shadowCameraVisible");
    delegater.property("shadowBias");
    delegater.property("shadowDarkness");
    delegater.property("shadowMapWidth");
    delegater.property("shadowMapHeight");
    delegater.property("shadowCascade");
    delegater.property("shadowCascadeOffset");
    delegater.property("shadowCascadeCount");
    delegater.property("shadowCascadeBias");
    delegater.property("shadowCascadeWidth");
    delegater.property("shadowCascadeHeight");
    delegater.property("shadowCascadeNearZ");
    delegater.property("shadowCascadeFarZ");
    delegater.property("shadowCascadeArray");
    delegater.property("shadowMap");
    delegater.property("shadowMapSize");
    delegater.property("shadowCamera");
    delegater.property("shadowMatrix");
});

/*
 * utils.js
 */

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");

    phina.three = phina.three || {};

    phina.three.Utils = {
        
    };
});

/*
 * effect.js
 */
phina.namespace(function() {
    
    phina.three = phina.three || {};
    
    phina.three.EffectModules = [

        "postprocessing/AdaptiveToneMappingPass",
        "postprocessing/BloomPass",
        "postprocessing/BokehPass",
        "postprocessing/DotScreenPass",
        "postprocessing/EffectComposer",
        "postprocessing/FilmPass",
        "postprocessing/GlitchPass",
        "postprocessing/MaskPass",
        "postprocessing/RenderPass",
        "postprocessing/SavePass",
        "postprocessing/ShaderPass",
        "postprocessing/TexturePass",

        "shaders/BasicShader",
        "shaders/BleachBypassShader",
        "shaders/BlendShader",
        "shaders/BokehShader",
        "shaders/BokehShader2",
        "shaders/BrightnessContrastShader",
        "shaders/ColorCorrectionShader",
        "shaders/ColorifyShader",
        "shaders/ConvolutionShader",
        "shaders/CopyShader",
        "shaders/DOFMipMapShader",
        "shaders/DigitalGlitch",
        "shaders/DotScreenShader",
        "shaders/EdgeShader",
        "shaders/EdgeShader2",
        "shaders/FXAAShader",
        "shaders/FilmShader",
        "shaders/FocusShader",
        "shaders/FresnelShader",
        "shaders/HorizontalBlurShader",
        "shaders/HorizontalTiltShiftShader",
        "shaders/HueSaturationShader",
        "shaders/KaleidoShader",
        "shaders/LuminosityShader",
        "shaders/MirrorShader",
        "shaders/NormalDisplacementShader",
        "shaders/NormalMapShader",
        "shaders/OceanShaders",
        "shaders/ParallaxShader",
        "shaders/RGBShiftShader",
        "shaders/SSAOShader",
        "shaders/SepiaShader",
        "shaders/TechnicolorShader",
        "shaders/ToneMapShader",
        "shaders/TriangleBlurShader",
        "shaders/UnpackDepthRGBAShader",
        "shaders/VerticalBlurShader",
        "shaders/VerticalTiltShiftShader",
        "shaders/VignetteShader",
        
    ].reduce(function(obj, _) {
        var url = "https://cdn.rawgit.com/mrdoob/three.js/r71/examples/js/" + _ + ".js";
        obj[url] = url;
        return obj;
    }, {});

});

/*
 * geom.js
 */

phina.namespace(function() {
    
    phina.geom.Vector2.prototype.toThree = function() {
        return new THREE.Vector2(this.x, this.y);
    };
    THREE.Vector2.prototype.toTm = function() {
        return phina.geom.Vector2(this.x, this.y);
    };
    
    phina.geom.Vector3.prototype.toThree = function() {
        return new THREE.Vector3(this.x, this.y, this.z);
    };
    THREE.Vector3.prototype.toTm = function() {
        return phina.geom.Vector3(this.x, this.y, this.z);
    };
    
    phina.geom.Matrix33.prototype.toThree = function() {
        return new THREE.Matrix3(
            this.m00, this.m01, this.m02,
            this.m10, this.m11, this.m12,
            this.m20, this.m21, this.m22
        );
    };
    THREE.Matrix3.prototype.toTm = function() {
        var e = this.elements;
        return phina.geom.Matrix33(
            e[0], e[3], e[6],
            e[1], e[4], e[7],
            e[2], e[5], e[8]
        );
    };
    
    phina.geom.Matrix44.prototype.toThree = function() {
        return new THREE.Matrix4(
            this.m00, this.m01, this.m02, this.m03,
            this.m10, this.m11, this.m12, this.m13,
            this.m20, this.m21, this.m22, this.m23,
            this.m30, this.m31, this.m32, this.m33
        );
    };
    THREE.Matrix4.prototype.toTm = function() {
        var e = this.elements;
        return phina.geom.Matrix44(
            e[0], e[4], e[8], e[12],
            e[1], e[5], e[9], e[13],
            e[2], e[6], e[10], e[14],
            e[3], e[7], e[11], e[15]
        );
    };
    
});

var phina = phina || {};
/** @namespace */
phina.asset = phina.asset || {};

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");

    phina.asset = phina.asset || {};

    phina.define("phina.asset.ThreeJSON", {
        superClass: "phina.asset.Asset",

        model: null,
        modelPath: "",

        init: function() {
            this.superInit();
        },

        _load: function(resolve) {
            if (phina.asset.ThreeJSON.loader === null) {
                phina.asset.ThreeJSON.loader = new THREE.JSONLoader();
            }

            var that = this;
            phina.asset.ThreeJSON.loader.load(path, function(geometry, materials) {
                this.build(geometry, materials);
                resolve(this);
            }.bind(this));
        },
        build: function(geometry, materials) {
            materials.forEach(function(m) {
                m.shading = THREE.FlatShading;
            });
            this.mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        },
        _static: {
            loader: null,
        },
    });
});

var phina = phina || {};
/** @namespace */
phina.asset = phina.asset || {};

phina.namespace(function() {
    // var phina = require("../../../libs/phinalib");
    // var THREE = require("../../../libs/three");

    phina.asset = phina.asset || {};

    phina.define("phina.asset.ThreeJSON", {
        superClass: "phina.asset.Asset",

        model: null,
        modelPath: "",

        init: function() {
            this.superInit();
        },

        _load: function(resolve) {
            if (phina.asset.Vox.parser === null) {
                phina.asset.Vox.parser = new vox.Parser();
            }

            var that = this;
            phina.asset.Vox.parser.parse(path).then(function(voxelData) {
                var builder = new vox.MeshBuilder(voxelData);
                this.mesh = builder.createMesh();
                resolve(this);
            }.bind(this));
        },
        _static: {
            paeser: null,
        },
    });
});
