var Shapoid = cc.PhysicsSprite.extend({
    body: null,
    shape: null,
    type: null,
    ctor: function() {
        this._super();
        cc.log("Whee!!");
        cc.log(res.shapoid_ball_png);
        this.initWithFile(res.shapoid_ball_png);

        this.body = new cp.Body(10, cp.momentForCircle(10, 0, 10, cp.vzero));

        this.shape = new cp.CircleShape(this.body, 10, cp.vzero);
        this.shape.setElasticity(1.0);
        this.shape.setFriction(0.0);

        this.setBody(this.body);

        this.shape.setCollisionType(1);

        this.type = "circloid";

    },

    morphToTriangloid : function() {
        this.type = "triangloid";
        cc.log('new type is', this.type);
        
        cc.textureCache.addImage(res.triangloid_png);

        this.setTexture(cc.textureCache.getTextureForKey(res.triangloid_png));
        var verts = [-10, -10,
                     0, 10,
                     10, -10,
        ];
        this.shape = new cp.PolyShape(this.body, verts, cp.vzero);
        this.getBody().resetForces();
        
    },

    update : function(dt) {
        if (this.type === "triangloid") {
            this.getBody().applyForce(cp.v(0, 20), cp.vzero);
        }
        
    },


    applyImpulse : function(dir) {
        var body = this.getBody();
        var vel = body.getVel();
        if (dir.x > 0 && vel.x < 40) {
            body.applyImpulse(dir, cp.vzero);
        }

        if (dir.x < 0 && vel.x > -40) {
            body.applyImpulse(dir, cp.vzero);
        }
    },

    resetImpulse: function() {
        var body = this.getBody();
        var vel = body.getVel();
        body.setVel(cp.v(0, vel.y));
    },

    getType : function() {
        return this.type;
    }

    
});
