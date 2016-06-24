/*
 *  Application.js
 *  2016/06/07
 *  @auther minimo  
 *  This Program is MIT license.
 */

//namespace tac(glTACtics)
tac = {};

phina.define("tac.Application", {
    superClass: "phina.display.CanvasApp",

	_static: {
        version: "0.0.1",
        assets: {
            "preload": {
                font: {
                    "UbuntuMono":   "fonts/UbuntuMono-Bold.ttf",
                    "Orbitron":     "fonts/Orbitron-Regular.ttf",
                },
            },
            "common": {
                mqo: {
                    "gradriel":     "assets/gradriel_pose.mqo",
                    "ground":       "assets/ground.mqo",
                },
            },
        },
    },

    _member: {
        //ＢＧＭ＆効果音
        soundset: null,

        //バックグラウンドカラー
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },

    init: function() {
        this.superInit({
            query: '#world',
            width: SC_W,
            height: SC_H,
        });
        this.$extend(this._member);

        this.fps = 60;

        //設定情報の読み込み
        this.loadConfig();

        //ＢＧＭ＆ＳＥ
        this.soundset = phina.extension.SoundSet();

        this.replaceScene(tac.SceneFlow());
    },

    _onLoadAssets: function() {
        this.soundset.readAsset();
    },

    //設定データの保存
    saveConfig: function() {
        return this;
    },

    //設定データの読み込み
    loadConfig: function() {
        return this;
    },

    playBGM: function(asset, loop, callback) {
        if (loop === undefined) loop = true;
        this.soundset.playBGM(asset, loop, callback);
    },

    stopBGM: function(asset) {
        this.soundset.stopBGM();
    },

    setVolumeBGM: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeBGM(vol);
    },

    playSE: function(asset) {
        this.soundset.playSE(asset);
    },

    setVolumeSE: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeSE(vol);
    },

    _accessor: {
        volumeBGM: {
            "get": function() { return this.sounds.volumeBGM; },
            "set": function(vol) { this.setVolumeBGM(vol); }
        },
        volumeSE: {
            "get": function() { return this.sounds.volumeSE; },
            "set": function(vol) { this.setVolumeSE(vol); }
        }
    }
});
