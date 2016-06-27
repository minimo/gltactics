"use strict";

var mqo = {};

(function() {

    mqo.Parser = function() {};
    mqo.Parser.prototype.parse = function(url) {
        var modelurl = this.url.split("/");
        this.modelPath = "";
        for (var i = 0, len = modelurl.length; i < len-1; i++) {
            this.modelPath += modelurl[i];
        }

        var that = this;
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.onload = function() {
            var data = req.responseText;
            that.model = new mqo.Model(data, that.modelPath);
            resolve(that);
        };
        req.send(null);

    };

    /*
     * メタセコイアモデル
     */
    mqo.Model = function(data, path) {
        this.path = path || "";
        this.meshes = [];
        this._rawMeshes = [];
        this._rawMaterials = null;
        this.parse(data);
    };
    mqo.Model.prototype.parse = function(data) {
        // マテリアル
        var materialText = data.match(/^Material [\s\S]*?^\}/m);
        this._rawMaterials = new mqo.Material(materialText[0]);       //マテリアルチャンクは原則一つ

        // オブジェクト
        var objectText = data.match(/^Object [\s\S]*?^\}/gm);
        for (var i = 0, len = objectText.length; i < len; ++i) {
            var mesh = new mqo.Mesh(objectText[i], this.path);
            this._rawMeshes.push(mesh);
        }
    };

    /*
     * メタセコイアメッシュ
     */
    mqo.Mesh = function(data path) {
        this.path = path || "";

        this.vertices = [];
        this.faces = [];
        this.vertNormals = [];

        this.facet =  59.5;     // スムージング角度
        this.mirror = 0;        //ミラーリング
        this.mirrorAxis = 0;    //ミラーリング軸

        this.parse(data);
    };
    mqo.Mesh.prototype.parse = function(data) {
        //オブジェクト名
        var name = data.split(' ');
        this.name = name[1].replace(/"/g, "");

        //スムージング角
        var facet = data.match(/facet ([0-9\.]+)/);
        if( facet ){ this.facet = Number(facet[1]); }

        //可視フラグ
        var visible = data.match(/visible ([0-9\.]+)/);
        if( visible ){ this.visible = Number(visible[1]); }

        //ミラーリング
        var mirror = data.match(/mirror ([0-9])/m);
        if( mirror ){
            this.mirror = Number(mirror[1]);
            // 軸
            var mirrorAxis = data.match(/mirror_axis ([0-9])/m);
            if( mirrorAxis ){
                this.mirrorAxis = Number(mirrorAxis[1]);
            }
        }

        //頂点情報
        var vertex_txt = data.match(/vertex ([0-9]+).+\{\s([\w\W]+)}$/gm);
        this._parseVertices( RegExp.$1, RegExp.$2 );

        //フェース情報
        var face_txt = data.match(/face ([0-9]+).+\{\s([\w\W]+)}$/gm);
        this._parseFaces( RegExp.$1, RegExp.$2 );
    };
    //頂点情報のパース
    mqo.Mesh.prototype._parseVertices = function(num, data) {
        var scale = 0.1;
        var vertexTextList = data.split('\n');
        for (var i = 0; i <= num; i++) {
            var vertex = vertexTextList[i].split(' ');
            if (vertex.length < 3)continue;
            var v = {};
            v.x = Number(vertex[0])*scale;
            v.y = Number(vertex[1])*scale;
            v.z = Number(vertex[2])*scale;
            this.vertices.push(v);
        }

        //ミラーリング対応
        if (this.mirror) {
            var self = this;
            var toMirror = (function(){
                return {
                    1: function(v) { return [ v[0]*-1, v[1], v[2] ]; },
                    2: function(v) { return [ v[0], v[1]*-1, v[2] ]; },
                    4: function(v) { return [ v[0], v[1], v[2]*-1 ]; },
                }[self.mirrorAxis];
            })();
            var len = this.vertices.length;
            for (var i = 0; i < len; i++) {
                this.vertices.push(toMirror(this.vertices[i]));
            }
        }
    };
    //フェース情報のパース
    mqo.Mesh.prototype._parseFaces = function(num, data) {
        var faceTextList = data.split('\n');

        //法線計算
        var calcNormalize = function(a, b, c) {
            var v1 = [ a[0] - b[0], a[1] - b[1], a[2] - b[2] ];
            var v2 = [ c[0] - b[0], c[1] - b[1], c[2] - b[2] ];
            var v3 = [
                v1[1]*v2[2] - v1[2]*v2[1],
                v1[2]*v2[0] - v1[0]*v2[2],
                v1[0]*v2[1] - v1[1]*v2[0]
            ];
            var len = Math.sqrt(v3[0]*v3[0] + v3[1]*v3[1] + v3[2]*v3[2]);
            v3[0] /= len;
            v3[1] /= len;
            v3[2] /= len;

            return v3;
        };

        for (var i = 0; i <= num; i++ ){
            // トリムっとく
            var faceText = faceTextList[i].replace(/^\s+|\s+$/g, "");
            // 面の数
            var vertex_num = Number(faceText[0]);

            var info = faceText.match(/([A-Za-z]+)\(([\w\s\-\.\(\)]+?)\)/gi);
            var face = { vNum: vertex_num };
            if (!info) continue;
            
            for (var j = 0, len = info.length; j < len; j++) {
                var m = info[j].match(/([A-Za-z]+)\(([\w\s\-\.\(\)]+?)\)/);
                var key = m[1].toLowerCase();
                var value = m[2].split(" ");
                value.forEach(function(elm, i, arr){
                    arr[i] = Number(elm);
                });
                face[key] = value;
            }
            
            // UV デフォルト値
            if (!face.uv) {
                face.uv = [0, 0, 0, 0, 0, 0, 0, 0];
            }

            // マテリアル デフォルト値
            if (!face.m) {
                face.m = [undefined];
            }

            // 法線（面の場合のみ）
            if (face.v.length > 2) {
                face.n = calcNormalize(this.vertices[face.v[0]], this.vertices[face.v[1]], this.vertices[face.v[2]]);
            }

            this.faces.push(face);
        }

        // ミラーリング対応
        if( this.mirror ){
            var swap = function(a,b){ var temp = this[a]; this[a] = this[b]; this[b] = temp; return this; };
            var len = this.faces.length;
            var vertexOffset = (this.vertices.length/2);
            for(var i = 0; i < len; i++) {
                var targetFace = this.faces[i];
                var face = {
                    uv  : [],
                    v   : [],
                    vNum: targetFace.vNum,
                };
                for (var j = 0; j < targetFace.v.length; j++) { face.v[j] = targetFace.v[j] + vertexOffset; }
                for (var j = 0; j < targetFace.uv.length; j++) { face.uv[j] = targetFace.uv[j]; }

                if (face.vNum == 3) {
                    swap.call(face.v, 1, 2);
                } else {
                    swap.call(face.v, 0, 1);
                    swap.call(face.v, 2, 3);
                }

                face.n = targetFace.n;
                face.m = targetFace.m;

                this.faces.push(face);
            }
        }

        // 頂点法線を求める
        var vertNormal = Array(this.vertices.length);
        for (var i = 0, len = this.vertices.length; i < len; i++) vertNormal[i] = [];

        for (var i = 0; i < this.faces.length; i++) {
            var face = this.faces[i];
            var vIndices = face.v;

            for (var j = 0; j < face.vNum; j++) {
                var index = vIndices[j];
                vertNormal[index].push.apply(vertNormal[index], face.n);
            }
        }

        for (var i = 0; i < vertNormal.length; i++) {
            var vn = vertNormal[i];
            var result = [0, 0, 0];
            var len = vn.length/3;
            for (var j = 0; j < len; j++) {
                result[0] += vn[j*3+0];
                result[1] += vn[j*3+1];
                result[2] += vn[j*3+2];
            }

            result[0] /= len;
            result[1] /= len;
            result[2] /= len;

            var len = Math.sqrt(result[0]*result[0] + result[1]*result[1] + result[2]*result[2]);
            result[0] /= len;
            result[1] /= len;
            result[2] /= len;
            
            this.vertNormals[i] = result;
        }
    };

    /*
     * メタセコイアマテリアル
     */
    mqo.Material = function(data) {
        this.materials = [];
        this.parse(data);
    };
    //マテリアル情報のパース
    mqo.Material.prototype.parse = function(data) {
//        var infoText    = data.match(/^Material [0-9]* \{\r\n([\s\S]*?)\r\n^\}$/m);
//        var matTextList = infoText[1].split('\n');
        var matTextList = data.split('\n');

        for (var i = 1, len = matTextList.length-1; i < len; i++) {
            var mat = {};
            // トリムっとく
            var matText = matTextList[i].replace(/^\s+|\s+$/g, "");
            var info = matText.match(/([A-Za-z]+)\(([\w\W]+?)\)/gi);    //マテリアル情報一個分抜く

            var nl = matText.split(' ');    //マテリアル名取得
            mat['name'] = nl[0].replace(/"/g, "");

            for( var j = 0, len2 = info.length; j < len2; j++ ){
                var m = info[j].match(/([A-Za-z]+)\(([\w\W]+?)\)/); //要素を抜き出す
                var key = m[1].toLowerCase();   //文字列小文字化
                var value = null;

                if( key != "tex" && key != "aplane" ){
                    //テクスチャ以外の要素
                    value = m[2].split(" ");
                    value.forEach(function(elm, i, arr){
                        arr[i] = Number(elm);
                    });
                }else{
                    //テクスチャの場合
                    value = m[2].replace(/"/g, "");
                }
                mat[key] = value;
            }
            this.materials.push(mat);
        }
    };

})();

