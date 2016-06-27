var mqo = {};

(function() {

    mqo.MeshBuilder = function() {
    };

    //THREE形式Mesh変換
    mqo.MeshBuilder.prototype.buildMesh = function(modelData, canvas) {
        var meshes = [];
        for (var i = 0, len = modelData._rawMeshes.length; i < len; i++) {
            var mesh = modelData._rawMeshes[i];
            var list = mesh.convertTHREE(modelData._rawMaterials, canvas);

            for (var j = 0, len2 = list.length; j < len2; j++) {
                meshes.push(list[j]);
            }
        }
        return meshes;
    };

    //GLBoost形式Mesh変換
    mqo.MeshBuilder.prototype.buildMeshGLBoost = function(modelData, canvas) {
    };

    /*
     * フェース情報からマテリアルに対応した頂点情報を構築
     * THREE形式専用
     */
    mqo.MeshBuilder.prototype.buildTHREE = function(modelData, num) {
        var mesh = modelData[num];
        mqoMat = modelData.materials[num];

         //マテリアル情報
        var mat = null;
        if (mqoMat) {
            //シェーダーパラメータによってマテリアルを使い分ける
            if(mqoMat.shader === undefined) {
                mat = new THREE.MeshPhongMaterial();
            } else if(mqoMat.shader == 2) {
                mat = new THREE.MeshLambertMaterial();
            } else if(mqoMat.shader == 3) {
                mat = new THREE.MeshPhongMaterial();
            } else  {
                mat = new THREE.MeshBasicMaterial();
            }
            var r = mqoMat.col[0];
            var g = mqoMat.col[1];
            var b = mqoMat.col[2];
//            if (mat.color) mat.color.setRGB(r*mqoMat.dif, g*mqoMat.dif, b*mqoMat.dif);
            if (mat.color) mat.color.setRGB(r, g, b);
            if (mat.emissive) mat.emissive.setRGB(r*mqoMat.emi*0.1, g*mqoMat.emi*0.1, b*mqoMat.emi*0.1);
            if (mat.ambient) mat.ambient.setRGB(r*mqoMat.amb, g*mqoMat.amb, b*mqoMat.amb);
            if (mat.specular) mat.specular.setRGB(r*mqoMat.spc, g*mqoMat.spc, b*mqoMat.spc);
            if (mqoMat.tex) {
                mat.map = THREE.ImageUtils.loadTexture(this.path+"/"+mqoMat.tex);
            }
            if (mqoMat.aplane) {
                mat.alphaMap = THREE.ImageUtils.loadTexture(this.path+"/"+mqoMat.aplane);
            }
            mat.transparent = true;
            mat.shiness = mqoMat.power;
            mat.opacity = mqoMat.col[3];
        } else {
            //デフォルトマテリアル
            mat = new THREE.MeshBasicMaterial();
            mat.color.setRGB(0.7, 0.7, 0.7);
            mat.transparent = true;
            mat.shiness = 1.0;
        }

        //ジオメトリ情報
        var geo = new THREE.Geometry();

        //頂点情報初期化
        for(var i = 0; i < this.vertices.length; i++) {
            this.vertices[i].to = -1;
        }
        var countVertex = 0;

        //インデックス情報
        for (var i = 0, len = this.faces.length; i < len; i++) {
            var face = this.faces[i];
            if (face.m != num) continue;
            if (face.vNum < 3) continue;

            var vIndex = face.v;
            if (face.vNum == 3) {
                //法線
                var nx = face.n[0];
                var ny = face.n[1];
                var nz = face.n[2];
                var normal =  new THREE.Vector3(nx, ny, nz);

                //フェース情報
                var index = [];
                index[0] = vIndex[2];
                index[1] = vIndex[1];
                index[2] = vIndex[0];
                for (var j = 0; j < 3; j++) {
                    var v = this.vertices[index[j]];
                    if (v.to != -1) {
                        index[j] = v.to;
                    } else {
                        v.to = countVertex;
                        index[j] = v.to;
                        countVertex++;
                    }
                }
                var face3 = new THREE.Face3(index[0], index[1], index[2], normal, undefined, face.m[0]);

                //頂点法線
                face3.vertexNormals.push(normal);
                face3.vertexNormals.push(normal);
                face3.vertexNormals.push(normal);

                geo.faces.push(face3);

                // ＵＶ座標
                geo.faceVertexUvs[0].push([
                    new THREE.Vector2(face.uv[4], 1.0 - face.uv[5]),
                    new THREE.Vector2(face.uv[2], 1.0 - face.uv[3]),
                    new THREE.Vector2(face.uv[0], 1.0 - face.uv[1])]);
            } else if (face.vNum == 4) {
                //法線
                var nx = face.n[0];
                var ny = face.n[1];
                var nz = face.n[2];
                var normal =  new THREE.Vector3(nx, ny, nz);

                //四角を三角に分割
                {
                    //フェース情報
                    var index = [];
                    index[0] = vIndex[3];
                    index[1] = vIndex[2];
                    index[2] = vIndex[1];
                    for (var j = 0; j < 3; j++) {
                        var v = this.vertices[index[j]];
                        if (v.to != -1) {
                            index[j] = v.to;
                        } else {
                            v.to = countVertex;
                            index[j] = v.to;
                            countVertex++;
                        }
                    }
                    var face3 = new THREE.Face3(index[0], index[1], index[2], normal, undefined, face.m[0]);
//                    var face3 = new THREE.Face3(vIndex[3], vIndex[2], vIndex[1], normal, undefined, face.m[0]);

                    //頂点法線
                    face3.vertexNormals.push(normal);
                    face3.vertexNormals.push(normal);
                    face3.vertexNormals.push(normal);

                    geo.faces.push(face3);

                    // ＵＶ座標
                    geo.faceVertexUvs[0].push([
                        new THREE.Vector2(face.uv[6], 1.0 - face.uv[7]),
                        new THREE.Vector2(face.uv[4], 1.0 - face.uv[5]),
                        new THREE.Vector2(face.uv[2], 1.0 - face.uv[3])]);
                }
                {
                    //フェース情報
                    var index = [];
                    index[0] = vIndex[1];
                    index[1] = vIndex[0];
                    index[2] = vIndex[3];
                    for (var j = 0; j < 3; j++) {
                        var v = this.vertices[index[j]];
                        if (v.to != -1) {
                            index[j] = v.to;
                        } else {
                            v.to = countVertex;
                            index[j] = v.to;
                            countVertex++;
                        }
                    }
                    var face3 = new THREE.Face3(index[0], index[1], index[2], normal, undefined, face.m[0]);
//                    var face3 = new THREE.Face3(vIndex[1], vIndex[0], vIndex[3], normal, undefined, face.m[0]);

                    //頂点法線
                    face3.vertexNormals.push(normal);
                    face3.vertexNormals.push(normal);
                    face3.vertexNormals.push(normal);

                    geo.faces.push(face3);

                    // ＵＶ座標
                    geo.faceVertexUvs[0].push([
                        new THREE.Vector2(face.uv[2], 1.0 - face.uv[3]),
                        new THREE.Vector2(face.uv[0], 1.0 - face.uv[1]),
                        new THREE.Vector2(face.uv[6], 1.0 - face.uv[7])]);
                }
            }
        }

        //頂点情報
        var scale = 1;
        this.vertices.sort(function(a, b) {
            return a.to - b.to;
        });
        for(var i = 0; i < this.vertices.length; i++) {
            var v = this.vertices[i];
            if (v.to != -1) {
                var x = v.x*scale;
                var y = v.y*scale;
                var z = v.z*scale;
                geo.vertices.push(new THREE.Vector3(x, y, z));
            }
        }

        //各種情報計算
        geo.computeBoundingBox();
        geo.computeFaceNormals();
        geo.computeVertexNormals();

        //メッシュ生成
        var obj = new THREE.Mesh(geo, mat);
        return obj;
    };

    /*
     * フェース情報からマテリアルに対応した頂点情報を構築
     * GLBoost形式専用
     */
    mqo.MeshBuilder.prototype.buildGLBoost = function(num, mqoMat, canvas) {
        //マテリアル情報
        var mat = null;
        if (mqoMat) {
            mat = new GLBoost.ClassicMaterial(canvas);
            mat.shader = new GLBoost.PhongShader(canvas);

            var r = mqoMat.col[0];
            var g = mqoMat.col[1];
            var b = mqoMat.col[2];
            if (mat.color) mat.diffuseColor = new Vector3(r, g, b);
            if (mat.ambient) mat.ambientColor = new Vector3(r*mqoMat.amb, g*mqoMat.amb, b*mqoMat.amb);
            if (mat.specular) mat.specularColor = new Vector3(r*mqoMat.spc, g*mqoMat.spc, b*mqoMat.spc);
            if (mqoMat.tex) {
                  mat.diffuseTexture = new GLBoost.Texture(this.path+"/"+mqoMat.tex);
            }
            if (mqoMat.aplane) {
                  mat.alphaTexure = new GLBoost.Texture(this.path+"/"+mqoMat.aplane);
            }
        } else {
            //デフォルトマテリアル
            mat = new GLBoost.ClassicMaterial(canvas);
            mat.shader = new GLBoost.PhongShader(canvas);
            mat.diffuseColor = new Vector3(0.7, 0.7, 0.7);
        }

        //ジオメトリ情報
        var geo = new GLBoost.Geometry(canvas);

        //頂点情報
/*
        var positions = [];
        for(var i = 0; i < this.vertices.length; i++) {
            var v = new GLBoost.Vector3(this.vertices[i].x, this.vertices[i].y, this.vertices[i].z);
            positions.push(v);
        }
*/
        //インデックス情報
        var positions = [];
        var indices = [];
        var normals = [];
        var colors = [];
        var texcoords = [];
        for (var i = 0, len = this.faces.length; i < len; i++) {
            var face = this.faces[i];
            if (face.m != num) continue;
            if (face.vNum < 3) continue;

            var vIndex = face.v;
            if (face.vNum == 3) {

                var i2 = vIndex[2], i1 = vIndex[1], i0 = vIndex[0];
                positions.push(new GLBoost.Vector3(this.vertices[i2].x, this.vertices[i2].y, this.vertices[i2].z));
                positions.push(new GLBoost.Vector3(this.vertices[i1].x, this.vertices[i1].y, this.vertices[i1].z));
                positions.push(new GLBoost.Vector3(this.vertices[i0].x, this.vertices[i0].y, this.vertices[i0].z));

                //インデックス情報
                indices.push(vIndex[2]);
                indices.push(vIndex[1]);
                indices.push(vIndex[0]);

                //頂点法線（絶賛手抜き中）
                normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));
                normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));
                normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));

                // ＵＶ座標
                texcoords.push(new GLBoost.Vector2(face.uv[4], face.uv[5]));
                texcoords.push(new GLBoost.Vector2(face.uv[2], face.uv[3]));
                texcoords.push(new GLBoost.Vector2(face.uv[0], face.uv[1]));
                
                //頂点色（暫定）
                colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
                colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
                colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
            } else if (face.vNum == 4) {
                //四角を三角に分割
                {
                    var i3 = vIndex[3], i2 = vIndex[2], i1 = vIndex[1];
                    positions.push(new GLBoost.Vector3(this.vertices[i3].x, this.vertices[i3].y, this.vertices[i3].z));
                    positions.push(new GLBoost.Vector3(this.vertices[i2].x, this.vertices[i2].y, this.vertices[i2].z));
                    positions.push(new GLBoost.Vector3(this.vertices[i1].x, this.vertices[i1].y, this.vertices[i1].z));

                    //インデックス情報
                    indices.push(vIndex[3]);
                    indices.push(vIndex[2]);
                    indices.push(vIndex[1]);

                    //頂点法線（絶賛手抜き中）
                    normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));
                    normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));
                    normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));

                    // ＵＶ座標
                    texcoords.push(new GLBoost.Vector2(face.uv[6], face.uv[7]));
                    texcoords.push(new GLBoost.Vector2(face.uv[4], face.uv[5]));
                    texcoords.push(new GLBoost.Vector2(face.uv[2], face.uv[3]));

                    //頂点色（暫定）
                    colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
                    colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
                    colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
                }
                {
                    var i1 = vIndex[1], i0 = vIndex[0], i3 = vIndex[3];
                    positions.push(new GLBoost.Vector3(this.vertices[i1].x, this.vertices[i1].y, this.vertices[i1].z));
                    positions.push(new GLBoost.Vector3(this.vertices[i0].x, this.vertices[i0].y, this.vertices[i0].z));
                    positions.push(new GLBoost.Vector3(this.vertices[i3].x, this.vertices[i3].y, this.vertices[i3].z));

                    //インデックス情報
                    indices.push(vIndex[1]);
                    indices.push(vIndex[0]);
                    indices.push(vIndex[3]);

                    //頂点法線（絶賛手抜き中）
                    normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));
                    normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));
                    normals.push(new GLBoost.Vector3(face.n[0], face.n[1], face.n[2]));

                    // ＵＶ座標
                    texcoords.push(new GLBoost.Vector2(face.uv[2], face.uv[3]));
                    texcoords.push(new GLBoost.Vector2(face.uv[0], face.uv[1]));
                    texcoords.push(new GLBoost.Vector2(face.uv[6], face.uv[7]));

                    //頂点色（暫定）
                    colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
                    colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
                    colors.push(new GLBoost.Vector4(1.0, 1.0, 1.0, 1.0));
                }
            }
        }

        geo.setVerticesData({
            position: positions,
            color: colors,
            normal: normals,
            texcoord: texcoords
        });

        //メッシュ生成
        var obj = new GLBoost.Mesh(geo, mat);
        return obj;
    };
})();

