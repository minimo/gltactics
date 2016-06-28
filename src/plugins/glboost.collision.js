/*

    collison tools for GLBoost

*/
(function() {

GLBoost.Collision = {};

//Point�I�u�W�F�N�g
GLBoost.Collision.Point = function(position) {
    this.position = new GLBoost.Vector3(position.x, position.y, position.z);
};
GLBoost.Collision.Point.prototype.clone = function() {
    return new GLBoost.Collision.Point(this.position);
};

//Line�I�u�W�F�N�g
GLBoost.Collision.Line = function(start, end) {
    this.start = new GLBoost.Vector3(start.x, start.y, start.z);
    this.end = new GLBoost.Vector3(end.x, end.y, end.z);
};
GLBoost.Collision.Line.prototype.clone = function() {
    return new GLBoost.Collision.Line(this.start, this.end);
};

//Box�I�u�W�F�N�g
GLBoost.Collision.Box = function(min, max) {
    this.min = new GLBoost.Vector3(min.x, min.y, min.z);
    this.max = new GLBoost.Vector3(max.x, max.y, max.z);
};
GLBoost.Collision.Box.prototype.clone = function() {
    return new GLBoost.Collision.Box(this.min, this.max);
};

//Sphere�I�u�W�F�N�g
GLBoost.Collision.Sphere = function(position, radius) {
    this.position = new GLBoost.Vector3(position.x, position.y, position.z);
    this.radius = radius;
};
GLBoost.Collision.Sphere.prototype.clone = function() {
    return new GLBoost.Collision.Sphere(this.position, this.radius);
};

//Polygon�I�u�W�F�N�g
GLBoost.Collision.Polygon = function(p1, p2, p3) {
    this.p1 = new GLBoost.Vector3(p1.x, p1.y, p1.z);
    this.p2 = new GLBoost.Vector3(p2.x, p2.y, p2.z);
    this.p3 = new GLBoost.Vector3(p3.x, p3.y, p3.z);
};
GLBoost.Collision.Polygon.prototype.clone = function() {
    return new GLBoost.Collision.Polygon(this.p1, this.p2, this.p3);
};

//�_�Ɛ����̐ڐG����
GLBoost.Collision.Point.prototype.testLine(start, end)
{
    var tmp = end.clone().substract(start);   //�n�_����I�_�֌������x�N�g��
    var vl = tmp.clone().nomalize();
    tmp = this.position.clone().substract(start);	//�n�_���画��_�֌������x�N�g��
    var vp = tmp.clone().nomalize();

	// �n�_�����Ƃ�����(�n�_,����_)�Ɛ�(�n�_,�I�_)�̊p�x��90�x�ȏ゠������false��Ԃ��D
	var dot = vp.dotProduct(vl);
	if( dot < 0 ) return false;

	// �I�_�����_�ɂ��Ďn�_�֌������x�N�g��
	vl.multiply(-1);
	// �I�_�����_�ɂ��Ĕ���_�֌������x�N�g��
	tmp = this.position.clone().substract(end);
	var vp = tmp.clone().nomalize();

	// �I�_�����Ƃ�����(�I�_,����_)�Ɛ�(�I�_,�n�_)�̊p�x��90�x�ȏ゠������false��Ԃ��D
	return vp.dotProduct(vl) < 0? false: true;
}

//�_�Ɩʂ̏Փ˔���
GLBoost.Collision.Point.prototype.testPolygon(polygon)
{
	var tmp1 = p2.clone().substract(p1);
	var tmp2 = p3.clone().substract(p2);
	tmp1 = tmp1.cross(tmp2);
	var n = tmp.normalize();	//�@���̌v�Z

	var dis = Math.abs(point.dotProduct(n));		//�����̎Z�o
	if( -0.0001 < dis && dis < 0.0001 )return true;	//�ꉞ�덷���l��
	return false;
}

})();
