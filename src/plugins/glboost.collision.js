/*

    collison tools for GLBoost

*/
(function() {

GLBoost.Collision = {};

//Pointオブジェクト
GLBoost.Collision.Point = function(position) {
    this.position = new GLBoost.Vector3(position.x, position.y, position.z);
};
GLBoost.Collision.Point.prototype.clone = function() {
    return new GLBoost.Collision.Point(this.position);
};

//Lineオブジェクト
GLBoost.Collision.Line = function(start, end) {
    this.start = new GLBoost.Vector3(start.x, start.y, start.z);
    this.end = new GLBoost.Vector3(end.x, end.y, end.z);
};
GLBoost.Collision.Line.prototype.clone = function() {
    return new GLBoost.Collision.Line(this.start, this.end);
};

//Boxオブジェクト
GLBoost.Collision.Box = function(min, max) {
    this.min = new GLBoost.Vector3(min.x, min.y, min.z);
    this.max = new GLBoost.Vector3(max.x, max.y, max.z);
};
GLBoost.Collision.Box.prototype.clone = function() {
    return new GLBoost.Collision.Box(this.min, this.max);
};

//Sphereオブジェクト
GLBoost.Collision.Sphere = function(position, radius) {
    this.position = new GLBoost.Vector3(position.x, position.y, position.z);
    this.radius = radius;
};
GLBoost.Collision.Sphere.prototype.clone = function() {
    return new GLBoost.Collision.Sphere(this.position, this.radius);
};

//Polygonオブジェクト
GLBoost.Collision.Polygon = function(p1, p2, p3) {
    this.p1 = new GLBoost.Vector3(p1.x, p1.y, p1.z);
    this.p2 = new GLBoost.Vector3(p2.x, p2.y, p2.z);
    this.p3 = new GLBoost.Vector3(p3.x, p3.y, p3.z);
};
GLBoost.Collision.Polygon.prototype.clone = function() {
    return new GLBoost.Collision.Polygon(this.p1, this.p2, this.p3);
};

//点と線分の接触判定
GLBoost.Collision.Point.prototype.testLine(start, end)
{
    var tmp = end.clone().substract(start);   //始点から終点へ向かうベクトル
    var vl = tmp.clone().nomalize();
    tmp = this.position.clone().substract(start);	//始点から判定点へ向かうベクトル
    var vp = tmp.clone().nomalize();

	// 始点を軸とした線(始点,判定点)と線(始点,終点)の角度が90度以上あったらfalseを返す．
	var dot = vp.dotProduct(vl);
	if( dot < 0 ) return false;

	// 終点を原点にして始点へ向かうベクトル
	vl.multiply(-1);
	// 終点を原点にして判定点へ向かうベクトル
	tmp = this.position.clone().substract(end);
	var vp = tmp.clone().nomalize();

	// 終点を軸とした線(終点,判定点)と線(終点,始点)の角度が90度以上あったらfalseを返す．
	return vp.dotProduct(vl) < 0? false: true;
}

//点と面の衝突判定
GLBoost.Collision.Point.prototype.testPolygon(polygon)
{
	var tmp1 = p2.clone().substract(p1);
	var tmp2 = p3.clone().substract(p2);
	tmp1 = tmp1.cross(tmp2);
	var n = tmp.normalize();	//法線の計算

	var dis = Math.abs(point.dotProduct(n));		//距離の算出
	if( -0.0001 < dis && dis < 0.0001 )return true;	//一応誤差を考慮
	return false;
}

})();
