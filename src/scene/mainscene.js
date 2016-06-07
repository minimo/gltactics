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
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
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
        this.superInit();
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
        this.setup3D();

        //目隠し
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.tweener.setUpdateType('fps');
        this.mask.tweener.clear().fadeOut(10);

    },
    
    update: function(app) {
        var rotateMatrix = GLBoost.Matrix33.rotateY(-1.0);
        var rotatedVector = rotateMatrix.multiplyVector(this.camera.eye);
        this.camera.eye = rotatedVector;
        this.layer.x--;
        this.time++;
    },

    //３Ｄセットアップ
    setup3D: function() {
        var layer = phina.display.GLBoostLayer({
            width: SC_W,
            height: SC_H
        }).addChildTo(this);
        var material = new GLBoost.ClassicMaterial(layer.canvas);
        var texture = new GLBoost.Texture('assets/texture.png');
        material.diffuseTexture = texture;

        var planeGeometry = new GLBoost.Plane(10, 10, 10, 10, null);
        var plane = new GLBoost.Mesh(planeGeometry, material);
        layer.scene.add(plane);

        var cubeGeometry = new GLBoost.Cube(new GLBoost.Vector3(1,1,1), new GLBoost.Vector4(1,1,1,1));
        var cube = new GLBoost.Mesh(cubeGeometry, material);
        cube.translate = new GLBoost.Vector3(0, 2, 0);
        layer.scene.add(cube);

        this.camera = new GLBoost.Camera({
            eye: new GLBoost.Vector3(0.0, 5, 15.0),
            center: new GLBoost.Vector3(0.0, 5.0, 0.0),
            up: new GLBoost.Vector3(0.0, 1.0, 0.0)
        },{
            fovy: 45.0,
            aspect: SC_W/SC_H,
            zNear: 0.1,
            zFar: 300.0
        });
        layer.scene.add(this.camera);

        layer.scene.prepareForRender();
        this.layer = layer;
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
    },
});
