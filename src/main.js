/*
 *  main.js
 *  2016/06/07
 *  @auther minimo  
 *  This Program is MIT license.
 */

//スクリーンサイズ
SC_W = 800;
SC_H = 450;
SC_OFFSET_X = 0;
SC_OFFSET_Y = 0;
SC_W_C = SC_W*0.5;   //CENTER
SC_H_C = SC_H*0.5;

//インスタンス
var app;

//ショートハンド
var glb = GLBoost;

window.onload = function() {
    app = tac.Application();
    app.run();
//    app.enableStats();
};
