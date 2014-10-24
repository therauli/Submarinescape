var Shapoid = cc.PhysicsSprite.extend({
    body: null,
    shape: null,
    ctor: function() {
        this._super();
        cc.log("Whee!!");
        cc.log(res.shapoid_ball_png);
        this.initWithFile(res.shapoid_ball_png);

        
        this.body = new cp.Body(10, cp.momentForCircle(10, 0, 20, cp.vzero));
        this.body.p = cc.p(100, 100);

        this.shape = new cp.CircleShape(this.body, 20, cp.vzero);
        this.shape.setElasticity(1.0);
        this.shape.setFriction(0.0);

        this.setBody(this.body);
    }
});
