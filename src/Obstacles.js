var Tube = cc.PhysicsSprite.extend({
	body: null,
    shape: null,
    type: null,
    ctor: function() {
        this._super();
        cc.log("Tube");
        cc.log(res.tube_png);
        this.initWithFile(res.tube_png);

        this.body = new cp.Body(Infinity, cp.momentForCircle(10, 0, 10, cp.vzero));

        var size = this.getContentSize();
        
        var verts = [pos.x - size.width / 2, pos.y - size.height / 2,
                    pos.x - size.width / 2, pos.y + size.height / 2,
                    pos.x - size.width / 2+ size.width, pos.y + size.height / 2,
                    pos.x + size.width / 2, pos.y - size.height / 2];
                    
        this.shape = new cp.PolyShape(this.body, verts, cp.vzero);
        this.shape.setElasticity(1.0);
        this.shape.setFriction(0.0);

        this.setBody(this.body);

        this.shape.setCollisionType(6);

        this.type = "Tube";
});