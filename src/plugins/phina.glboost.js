phina.namespace(function() {

  phina.define("phina.glboost.DelegateUtil", {
    init: function(type) {
      this.type = type;
    },
    property: function(name, glbProperty) {
      if (glbProperty) {
        this.type.prototype.accessor(name, {
          get: function() {
            return this.glbObject[glbProperty][name];
          },
          set: function(v) {
            this.glbObject[glbProperty][name] = v;
          }
        });
      } else {
        this.type.prototype.accessor(name, {
          get: function() {
            return this.glbObject[name];
          },
          set: function(v) {
            this.glbObject[name] = v;
          }
        });
      }
      // add set[Propertyname] method
      this.type.prototype[createSetterName(name)] = function(v) {
        this[name] = v;
        return this;
      };
    },
    method: function(name, returnThis, glbProperty) {
      if (glbProperty) {
        this.type.prototype[name] = function() {
          var r = this.glbObject[glbProperty][name].apply(this.glbObject[glbProperty], arguments);
          if (returnThis) {
            return this;
          } else {
            return r;
          }
        }
      } else {
        this.type.prototype[name] = function() {
          var r = this.glbObject[name].apply(this.glbObject, arguments);
          if (returnThis) {
            return this;
          } else {
            return r;
          }
        }
      }
    },
  });
  function createSetterName(propertyName) {
    return "set" + propertyName[0].toUpperCase() + propertyName.substring(1);
  }
});

phina.namespace(function() {

  phina.define('phina.glboost.Element', {
    superClass: 'phina.app.Element',

    glbObject: null,

    init: function(glbObject) {
      this.superInit();
      this.glbObject = glbObject || new GLBoost.Element();
    },

    setScale: function(x, y, z) {
        if (arguments.length === 1) {
            y = x;
            z = x;
        }
        this.glbObject.scale.x = x;
        this.glbObject.scale.y = y;
        this.glbObject.scale.z = z;
        this.dirty = true;
    },

    _accessor: {
      scale: {
        set: function(v) { this.glbObject.scale = v; this.dirty = true; },
        get: function()  { return this.glbObject.scale; },
      },

      x: {
        set: function(v) { this.glbObject.translate.x = v; this.dirty = true; },
        get: function()  { return this.glbObject.translate.x; },
      },
      y: {
        set: function(v) { this.glbObject.translate.y = v; this.dirty = true;},
        get: function()  { return this.glbObject.translate.y; },
      },
      z: {
        set: function(v) { this.glbObject.translate.z = v; this.dirty = true;},
        get: function()  { return this.glbObject.translate.z; },
      },
      rotateX: {
        set: function(v) { this.glbObject.rotate.x = v; this.dirty = true;},
        get: function()  { return this.glbObject.rotate.x; },
      },
      rotateY: {
        set: function(v) { this.glbObject.rotate.y = v; this.dirty = true;},
        get: function()  { return this.glbObject.rotate.y; },
      },
      rotateZ: {
        set: function(v) { this.glbObject.rotate.z = v; this.dirty = true;},
        get: function()  { return this.glbObject.rotate.z; },
      },
      scaleX: {
        set: function(v) { this.glbObject.scale.x = v; this.dirty = true;},
        get: function()  { return this.glbObject.scale.x; },
      },
      scaleY: {
        set: function(v) { this.glbObject.scale.y = v; this.dirty = true;},
        get: function()  { return this.glbObject.scale.y; },
      },
      scaleZ: {
        set: function(v) { this.glbObject.scale.z = v; this.dirty = true;},
        get: function()  { return this.glbObject.scale.z; },
      },
    },
  });
  var delegater = phina.glboost.DelegateUtil(phina.glboost.Element);
  delegater.property("translate");
  delegater.property("rotate");
  delegater.property("dirty");
});

phina.namespace(function() {

  phina.define('phina.glboost.Camera', {
    superClass: 'phina.glboost.Element',

    init: function(lookat, perspective) {
      var camera = new GLBoost.Camera(lookat, perspective);
      this.superInit(camera);
    },
  });
  var delegater = phina.glboost.DelegateUtil(phina.glboost.Camera);
  delegater.property("eye");
  delegater.property("center");
  delegater.property("up");
  delegater.property("aspect");
  delegater.property("zNear");
  delegater.property("zFar");
});

phina.namespace(function() {

  phina.define('phina.glboost.Mesh', {
    superClass: 'phina.glboost.Element',

    init: function(param, canvas) {
      param = param || {};
      canvas = canvas || null;
      if (typeof param === 'string') {
        //アセットからロード
        var obj = phina.asset.AssetManager.get("mqo", param);
        if (obj) {
          var mesh = obj.getMesh(canvas);
          this.superInit(mesh);
        } else {
          console.warn('Asset not found.['+param+']');
        }
      } if (param instanceof GLBoost.Mesh) {
        //GLBoostのMeshをセット
        this.superInit(param);
      } else {
        //パラメータとしてジオメトリとマテリアルを渡してメッシュを生成
        param = param.$safe({
          geometry: null,
          material: null,
        });
        if (param.geometry && param.material) {
          var obj = new GLBoost.Mesh(param.geometry, param.material);
          this.superInit(obj);
        } else {
          console.warn('Mesh parameter error.');
          this.superInit();
        }
      }
    },
  });
  var delegater = phina.glboost.DelegateUtil(phina.glboost.Mesh);
  delegater.property("geometry");
  delegater.property("material");
});
