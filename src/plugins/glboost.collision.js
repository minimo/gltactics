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

    //法線の計算
    var tmp1 = polygon.clone().p2.substract(polygon.p1);
    var tmp2 = polygon.clone().p3.substract(polygon.p2);
    this.normal = tmp1.cross(tmp2).normalize();
};
GLBoost.Collision.Polygon.prototype.clone = function() {
    return new GLBoost.Collision.Polygon(this.p1, this.p2, this.p3);
};

//点と線分の接触判定
GLBoost.Collision.Point.prototype.testLine(line)
{
    //始点から終点へ向かうベクトル(end-start)
    var vl = line.end.clone().substract(line.start).normalize();

    //始点から判定点へ向かうベクトル(point-start)
    var vp = this.position.clone().substract(line.start).normalize();

    // 始点を軸とした線(始点,判定点)と線(始点,終点)の角度が90度以上あったらfalseを返す．
    var dot = vp.dotProduct(vl);
    if( dot < 0 ) return false;

    // 終点を原点にして始点へ向かうベクトル
    vl.multiply(-1);
    // 終点を原点にして判定点へ向かうベクトル
    vp = this.position.clone().substract(line.end).nomalize();

    // 終点を軸とした線(終点,判定点)と線(終点,始点)の角度が90度以上あったらfalseを返す．
    return vp.dotProduct(vl) < 0? false: true;
}

//点と面の衝突判定（p1～3は同一の面に乗る３点）
GLBoost.Collision.Point.prototype.testSurface(polygon)
{
    //法線の計算
    var tmp1 = polygon.p2.clone().substract(polygon.p1);
    var tmp2 = polygon.p3.clone().substract(polygon.p2);
    tmp1.cross(tmp2);
    var n = tmp1.normalize();

    //距離の算出
    var dis = Math.abs(point.dotProduct(n));

    //一応誤差を考慮
    if( -0.0001 < dis && dis < 0.0001 )return true;
    return false;
}

//点と箱の衝突判定（内外判定）
GLBoost.Collision.Point.prototype.testBox(box)
{
	//マージンを取る
	if( box.min.x <= this.position.x + 0.001 && this.position.x - 0.001 <= box.max.x &&
		box.min.y <= this.position.y + 0.001 && this.position.y - 0.001 <= box.max.y &&
		box.min.z <= this.position.z + 0.001 && this.position.z - 0.001 <= box.max.z )return true;
	return false;

}

//三角形と点の衝突判定
GLBoost.Collision.Point.prototype.testPolygon(polygon)
{
    // エッジ(p1,p2) + pの法線をセット
    var ENml = polygon.clone().p2.substract(p1);
    var tmp2 = this.position.clone().substract(p2);
    ENml.corss(tmp2).normalize();
    // 二つのベクトルが鈍角なら三角の外に有るのでfalse
    if (polygon.normal.dotProduct(ENml) < -0.0001) return false;    //near

    // エッジ(p2,p3)を判定
    var ENml = polygon.clone().p3.substract(p2);
    var tmp2 = this.position.clone().substract(p3);
    ENml.corss(tmp2).normalize();
    if (polygon.normal.dotProduct(ENml) < -0.0001) return false;    //near

    // エッジ(p3,p1)を判定
    var ENml = polygon.clone().p1.substract(p3);
    var tmp2 = this.position.clone().substract(p1);
    ENml.corss(tmp2).normalize();
    if (polygon.normal.dotProduct(ENml) < -0.0001) return false;    //near

    // すべてクリアしたら三角の中に有るということでtrue
    return true;
}


//線と面の衝突判定
GLBoost.Collision.Line.prototype.testPoint(point) {
    return point.testLine(this);
};





})();
