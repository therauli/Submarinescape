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

    morphToEllipsoid : function() {
        this.type = "ellipsoid";
        cc.log('new type is', this.type);
        
        cc.textureCache.addImage(res.ellipsoid_png);
        
        this.setTexture(cc.textureCache.getTextureForKey(res.ellipsoid_png));

        var verts = [2, -10,
                    -2, -10,
                    -6, -5,
                    -6, 5,
                    -2, 10,
                     2, 10,
                     6, 6,
                     6, -6
                    ];

        this.shape = new cp.PolyShape(this.body, verts, cp.vzero);
        this.getBody().resetForces();

    },

    update : function(dt) {
        if (this.type === "triangloid") {
            var angle = this.getRotation();
            var dir = cp.v(Math.cos((90 - angle) * Math.PI / 180) * 30, Math.sin((90 - angle) * Math.PI / 180) * 30);
            //console.log(dir.x, dir.y);
            var body = this.getBody();
            var vel = body.getVel();
            var l = Math.sqrt(Math.pow(vel.x, 2) + Math.pow(vel.y, 2));  
            //console.log(l)
            if (l < 100) { 
                body.applyForce(dir, cp.vzero);
            } else {
                dir = cp.v(dir.x / 30, dir.y / 30);
                body.setVel(cp.v(dir.x * l, dir.y * l));
            }
        }
        
    },
    
    handleMove: function(dir) {
        if (this.type === "circloid") {
            this.applyImpulse(cc.pMult(dir, 100));
            cc.log('moving');
        }
        
        if (this.type === "triangloid") {
            var angle = this.getRotation() + dir.x * 8;
            this.setRotation(angle);
            
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
        if (this.type === "circloid") {
            var body = this.getBody();
            var vel = body.getVel();
            body.setVel(cp.v(0, vel.y));
        }
    },

    getType : function() {
        return this.type;
    }

    
});
