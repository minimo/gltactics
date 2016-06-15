/*
 *  SceneFlow.js
 *  2016/06/15
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("tac.SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = options || {};
        this.superInit(options.$safe({
            scenes: [{
                label: "splash",
                className: "tac.SplashScene",
                nextLabel: "load",
            },{
                label: "load",
                className: "tac.LoadingScene",
                arguments: {
                    assetType: "common"
                },
                nextLabel: "main",
            },{
                label: "title",
                className: "tac.TitleScene",
            },{
                label: "main",
                className: "tac.MainScene",
                nextLabel: "title",
            }],
        }));
    }
});
