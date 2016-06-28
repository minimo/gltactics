"use strict";

(function() {

    /*
     * raycaster
     */
    raycaster = function(scene, camera){
        this.scene = scene;
        this.camera = camera;
    };

    /*
     * raycaster.PickMesh
     */
    raycaster.prototype.PickMesh = function(ray) {
        var result = {
            mesh: null,     //接触メッシュ
            position: null, //接触近傍点
            distance: null, //始点からの距離
        };
        var elements = scene.elements;
        var len = elements.length;
        for (var i = 0; i < len; i++) {
            var e = elements[i];
            if (e instanceof GLBoost.Mesh) {
                return r = e.hitTestRay(ray);
            }
        }
        return result;
    };

    //GLBoost.Mesh拡張

    //境界箱計算
    GLBoost.Mesh.prototype.computeBoundingBox = function() {
        var min = new GLBoost.Vector3(10000, 10000, 10000);
        var max = new GLBoost.Vector3(-10000, -10000, -10000);
        var v = this.geometry.vertices;
        var len = v.length;
        for (var i = 0; i < len; i++) {
            var x = v[i].x;
            var y = v[i].y;
            var z = v[i].z;

            //最小
            min.x = min.x > x? x: min.x;
            min.y = min.y > y? x: min.y;
            min.z = min.z > z? x: min.z;
            //最大
            max.x = max.x < x? x: max.x;
            max.y = max.y < y? x: max.y;
            max.z = max.z < z? x: max.z;
        }
        this.boundingBox = {
            min: min,
            max: max,
        };
    };

    //境界箱と線分の接触判定
    GLBoost.Mesh.prototype.hitTestBoundingBox = function(line) {
        //境界箱が無い場合は計算する
        if (this.boundingBox === undefined) {
            this.computeBoundingBox();
        }

        //ワールド座標系へ変換
        var min = this.matrix.multiplyVector(this.boundingBox.min);
        var max = this.matrix.multiplyVector(this.boundingBox.max);

        //接触判定
        return true;
    }
    

    //Rayとの衝突判定
    GLBoost.Mesh.prototype.hitTestRay = function(ray) {
        ray = ray || {
            from: new GLBoost.Vec3(0, 0, 0),
            to: new GLBoost.Vector3(0, 0, 100),
        };
    };

})();


