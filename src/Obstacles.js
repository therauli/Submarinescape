var Pipe = cc.PhysicsSprite.extend({
	body: null,
    shape: null,
    type: null,
    ctor: function(pos) {
        this._super();
        this.initWithFile(res.pipe_png);

        var size = this.getContentSize();
        
        var verts = [-size.width / 2, -size.height / 2,
                     -size.width / 2, size.height / 2,
                      size.width / 2, size.height / 2,
                      size.width / 2, -size.height / 2];

        cc.log('Pipe verts:', verts);

        cc.log(size.width, size.height);

        

        this.body = new cp.Body(9999999, cp.momentForBox(999999, size.width, size.height));
        
        this.body.nodeIdleTime = Infinity;

        this.shape = new cp.PolyShape(this.body, verts, cp.vzero);

        this.shape.setElasticity(1.0);
        this.shape.setFriction(0.1);

        this.setBody(this.body);
        this.setPosition(pos);

        this.shape.setCollisionType(6);

        this.type = "Pipe";
        cc.log('Pipe created', pos);
    }
});
