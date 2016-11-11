/*
 *  MainScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("tac.MainScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        //ラベル用パラメータ
        labelParam: {
            fill: "black",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 16,
            fontWeight: ''
        },
        scorelabelParam: {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "left",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        },
    },

    init: function(option) {
        this.superInit({width: SC_W, height: SC_H});
        this.$extend(this._member);

        option = (option || {}).$safe({stageId: 1});
        this.stageId = option.stageId;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //３Ｄセットアップ
        this.layer = this.setup3D(SC_W, SC_H);
        this.layer.setOrigin(0.5, 0.5).setPosition(SC_W*0.5, SC_H*0.5);

        //５秒間の平均を取る
        var fps = [];
        fps.average = function() {
            var len = this.length;
            if (len > 300) {
                this.splice(0, 1);
                len--;
            }
            var total = 0;
            for (var i = 0; i < len; i++) {
                total += this[i];
            }
            return total/len;
        }

        //FPS表示
        var fpsLabel = phina.display.Label({text:"FPS"}.$safe(this.labelParam))
            .setOrigin(0,0)
            .addChildTo(this);
        fpsLabel.update = function() {
            var f = ~~(1/(app.deltaTime/1000));
            fps.push(f);
            this.text = "FPS : "+~~(fps.average());
        }

        //目隠し
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.tweener.setUpdateType('fps');
        this.mask.tweener.clear().fadeOut(10);
    },
    
    update: function(app) {
        var kb = app.keyboard;
        if (kb.getKey("up")) {
            var t = this.cube.translate;
            this.cube.translate = new GLBoost.Vector3(t.x, t.y, t.z+0.5);
        }
        if (kb.getKey("down")) {
            var t = this.cube.translate;
            this.cube.translate = new GLBoost.Vector3(t.x, t.y, t.z-0.5);
        }

        if (!app.mouse.getPointing()) {
            var rotateMatrix = new GLBoost.Matrix33.rotateY(-1);
            var rotatedVector = rotateMatrix.multiplyVector(this.camera.eye);
            this.camera.eye = rotatedVector;
        }

        this.time++;
    },

    //３Ｄセットアップ
    setup3D: function(width, height) {
        var layer = phina.display.GLBoostLayer({
            width: width,
            height: height
        }).addChildTo(this);
        var glBoostContext = layer.glBoostContext;

        //基準座標表示用
        var material = glBoostContext.createClassicMaterial(layer.canvas);
        var texture = glBoostContext.createTexture('assets/texture.png');
        material.diffuseTexture = texture;

        var planeGeometry = glBoostContext.createPlane(10, 10, 10, 10, null);
        var plane = glBoostContext.createMesh(planeGeometry, material);
        plane.translate = new GLBoost.Vector3(0, 0, 0);
        layer.scene.addChild(plane);


        //箱
        var material2 = glBoostContext.createClassicMaterial(layer.canvas);
        var texture2 = glBoostContext.createTexture('assets/logo.png');
        material2.diffuseTexture = texture2;

        var cubeGeometry = glBoostContext.createCube(new GLBoost.Vector3(1,1,1), new GLBoost.Vector4(1,1,1,1));
        var cube = glBoostContext.createMesh(cubeGeometry, material2);
        cube.translate = new GLBoost.Vector3(0, 3, 0);
        layer.scene.addChild(cube);
        this.cube = cube;

        //キャラクタメッシュ
        var mqo = phina.asset.AssetManager.get("mqo", "gradriel");
        var meshes = mqo.buildMeshGLBoost(glBoostContext);
        var m = meshes[0];
        m.translate = new GLBoost.Vector3(0, 0, 0);
        layer.scene.addChild(m);

        //地形メッシュ
        var mqo = phina.asset.AssetManager.get("mqo", "ground");
        var meshes = mqo.buildMeshGLBoost(glBoostContext);
        var m = meshes[0];
        m.translate = new GLBoost.Vector3(0, -5, 0);
        m.scale = new GLBoost.Vector3(10.0, 1.0, 10.0);
        layer.scene.addChild(m);

        //ボクセルメッシュ
        var parser = new vox.Parser();
        var p = parser.parse("assets/chr_fox.vox");
        var a = p.then(function(voxelData) {
            var d = voxelData;
            var builder = new vox.GLBoostMeshBuilder(voxelData);
            var mesh = builder.createMesh();
            layer.scene.addChild(mesh);
        });

        //カメラ
        this.camera = glBoostContext.createPerspectiveCamera({
            eye: new GLBoost.Vector3(0.0, 15, 40.0),
            center: new GLBoost.Vector3(0.0, 5.0, 0.0),
            up: new GLBoost.Vector3(0.0, 1.0, 0.0)
        },{
            fovy: 45.0,
            aspect: width/height,
            zNear: 0.1,
            zFar: 300.0
        });
        layer.scene.addChild(this.camera);

        //シーン準備完了通知
        layer.expression.prepareToRender();
        return layer;
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
        var x = e.pointer.deltaPosition.x*0.5;
        var y = e.pointer.deltaPosition.y*0.5;
        var rotateMatrixX = new GLBoost.Matrix33.rotateX(y);
        var rotateMatrixY = new GLBoost.Matrix33.rotateY(x);
        var rotMat = rotateMatrixX.multiply(rotateMatrixY);
        var rotatedVector = rotMat.multiplyVector(this.camera.eye);
        this.camera.eye = rotatedVector;
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
    },
});
