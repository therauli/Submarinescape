
var HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    space: null,
    shapoid: null,
    drawNode: null,
    startPoint: null,
    endPoint: null,

    ctor: function () {
        this._super();

        var size = cc.winSize;

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 0.5,
            rotation: 180
        });
        this.addChild(this.sprite, 0);

        this.sprite.runAction(
            cc.sequence(
                cc.rotateTo(2, 0),
                cc.scaleTo(2, 1, 1)
            )
        );

        cc.log('whee');
        this.shapoid = new Shapoid();

        this.startPoint = cc.p(100, 200);
        this.shapoid.setPosition(this.startPoint);

        this.endPoint = cc.p(300, 100);

        this.drawNode = new cc.DrawNode();
        this.addChild(this.drawNode, 50);
        
        this.initPhysics(size);
        this.scheduleUpdate();
        
        this.addChildPhysics(this.shapoid, 10);

        var that = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event){
                var x = 0;
                if (keyCode == 39) {
                    x = 100;
                }

                if (keyCode == 37) {
                    x = -100;
                }
                var dir = cp.v(x, 0);

                that.shapoid.applyImpulse(dir);

            },
            onKeyReleased: function(keyCode, event){
                that.shapoid.resetImpulse();

            }
        }, that);

        return true;
    },
    
    initPhysics: function(winSize) {
        space = new cp.Space();
        this.space = space;

        var staticBody = space.staticBody;

        var walls = [new cp.SegmentShape(staticBody, cp.v(0,0), cp.v(winSize.width,0), 2),
                     new cp.SegmentShape(staticBody, cp.v(0,winSize.height), cp.v(winSize.width,winSize.height), 1),
                     new cp.SegmentShape(staticBody, cp.v(0,0), cp.v(0,winSize.height), 1),
                     new cp.SegmentShape(staticBody, cp.v(winSize.width,0), cp.v(winSize.width,winSize.height), 1)];

        walls[0].setCollisionType(2);
        for (var i = 0; i < walls.length; i++) {
            var shape = walls[i];
            shape.setElasticity(1.0);
            shape.setFriction(0.0);
            space.addStaticShape(shape);
        }

        //add collision tag for bottom wall
        walls[0].setCollisionType(2);
        
        // Gravity
        space.gravity = cp.v(0, -100);

        //add some platforms
        // Starting platform
        this.addPlatform(cc.p(0, 50), cc.size(200, 10));
        
        // Left wall
        this.addPlatform(cc.p(0, 50), cc.size(10, 750));
        
        // Ceiling
        this.addPlatform(cc.p(0, 440), cc.size(800, 10));
        
        // Right wall
        this.addPlatform(cc.p(790, 50), cc.size(10, 750));
        
        // Middle platform
        this.addPlatform(cc.p(250, 50), cc.size(300, 10));
        
        // End platform
        this.addPlatform(cc.p(600, 50), cc.size(200, 10));


        // collisionhandler        
        space.addCollisionHandler(1, 2, this.collisionBottomBegin, null, null, null);
        cc.log('ekk');

        // debug stuph
        this._debugNode = new cc.PhysicsDebugNode(space);
        this._debugNode.visible = true; //set this 
        this.addChild(this._debugNode, 1000);

        // endpoint
        var endPoint = new EndPoint(staticBody, this.endPoint);
        space.addStaticShape(endPoint.shape);
        this.addChild(endPoint, 10);

        space.addCollisionHandler(1, 3, this.collisionEndBegin, null, null, null);
        cc.log('erete');



    },

    collisionBottomBegin : function(arbiter, space) {
        cc.log("doom");
    },

    collisionEndBegin : function(arbiter, space) {
        cc.log('Win!');
    },

    addPlatform : function(start, size) {
        var verts = [
            start.x, start.y,
            start.x, start.y + size.height,
            start.x + size.width, start.y + size.height,
            start.x + size.width, start.y
        ];

    
        
        var shape = new cp.PolyShape(this.space.staticBody, verts, cp.vzero);
        shape.setElasticity(1.0);
        shape.setFriction(0.0);
        this.space.addStaticShape(shape);

        this.drawNode.drawRect(start, cc.p(start.x + size.width, start.y + size.height), cc.color(255, 0, 0, 255), 1, cc.color(144, 0, 0 ,255));
    },

    update:function (dt) {
        // chipmunk step
        this.space.step(1/60);
    },
    
    addChildPhysics: function(obj, z) {
        this.addChild(obj, z)
        
        cc.log('Adding', obj);
        
        this.space.addBody(obj.body);

        this.space.addShape(obj.shape);
        
        
    }


});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

