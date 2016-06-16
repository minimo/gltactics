/*
 *  splashscene.js
 *  2015/12/02
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.namespace(function() {
    phina.define('tac.SplashScene', {
        superClass: 'phina.display.DisplayScene',

        init: function() {
            this.superInit({width: SC_W, height: SC_H});

            this.unlock = false;
            this.loadcomplete = false;

            //preload asset
            var assets = tac.Application.assets["preload"];
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                this.loadcomplete = true;
            }.bind(this));

            //logo(phina)
            var texture = phina.asset.Texture();
            texture.load(tac.SplashScene.logo).then(function() {
                this._init();
            }.bind(this));
            this.texture = texture;

            //logo(GLBoost)
            var texture2 = phina.asset.Texture();
            texture2.load(tac.SplashScene.logo_glb).then(function() {
                this._init();
            }.bind(this));
            this.texture2 = texture2;
        },

        _init: function() {
            this.sprite = phina.display.Sprite(this.texture)
                .addChildTo(this)
                .setPosition(this.gridX.center(), this.gridY.center())
                .setScale(0.3);
            this.sprite.alpha = 0;

            this.sprite.tweener
                .clear()
                .to({alpha:1}, 500, 'easeOutCubic')
                .call(function() {
                    this.unlock = true;
                }, this)
                .wait(1000)
                .to({alpha:0}, 500, 'easeOutCubic');

            this.sprite2 = phina.display.Sprite(this.texture2)
                .addChildTo(this)
                .setPosition(this.gridX.center(), this.gridY.center())
                .setScale(0.8);
            this.sprite2.alpha = 0;

            this.sprite2.tweener
                .clear()
                .wait(2250)
                .to({alpha:1}, 500, 'easeOutCubic')
                .wait(1000)
                .to({alpha:0}, 500, 'easeOutCubic')
                .wait(250)
                .call(function() {
                    this.exit();
                }, this);
        },

        update: function() {
            var kb = app.keyboard;
            if (kb.getKey("Z") || kb.getKey("space")) {
                if (this.unlock && this.loadcomplete) this.exit();
            }
        },

        onpointstart: function() {
            if (this.unlock && this.loadcomplete) this.exit();
        },

        _static: {
            logo: "assets/logo.png",
            logo_glb: "assets/logo_glb.png",
        },
    });
});
