
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
        this.currentLevel = 1;
        this.sprite = new cc.Sprite(res.bacground_png);
        this.addChild(this.sprite, 0);
        this.sprite.setOpacity( 150 );
        this.sprite.setPosition(size.width / 2,
                                size.height / 2 );

        cc.log('whee');
        this.shapoid = new Shapoid();

        this.startPoint = levels[this.currentLevel]["start"];
        this.shapoid.setPosition(this.startPoint);

        this.endPoint = levels[this.currentLevel]["end"];

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
                    x = 1;
                }

                if (keyCode == 37) {
                    x = -1;
                }
                var dir = cp.v(x, 0);

                //debug stuff only
                if (keyCode == 32) {
                    that.space.removeShape(that.shapoid.shape);
                    that.shapoid.morphToEllipsoid();//Triangloid();
                    that.space.addShape(that.shapoid.shape);
                }

                if (x !== 0) {
                    that.shapoid.handleMove(dir);
                }

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

        // Setup platforms
        for( var i = 0; i < levels[this.currentLevel]["platforms"].length; i++ ){
            this.addPlatform( levels[this.currentLevel]["platforms"][i] )

        }
        cc.log('Platforms, done');

        // setup obstacles if any        
        if( levels[this.currentLevel]["obstacles"] !== undefined ) {        
            for( var i = 0; i < levels[this.currentLevel]["obstacles"].length; i++ ){
                this.addObstacle( levels[this.currentLevel]["obstacles"][i] )
            }
        }
        
        cc.log('Obstacles, done');

        // collisionhandler        
        space.addCollisionHandler(1, 2, this.collisionBottomBegin, null, null, null);

        // debug stuph
        this._debugNode = new cc.PhysicsDebugNode(space);
        this._debugNode.visible = true; //set this 
        this.addChild(this._debugNode, 1000);

        // endpoint
        var endPoint = new EndPoint(staticBody, this.endPoint);
        space.addStaticShape(endPoint.shape);
        this.addChild(endPoint, 10);

        space.addCollisionHandler(1, 3, this.collisionEndBegin, null, null, null);

    },

    collisionBottomBegin : function(arbiter, space) {
        cc.log("doom");
    },

    collisionEndBegin : function(arbiter, space) {
        cc.log('Win!');
    },

    addPlatform : function( rect ) {
        var verts = [
            rect.x, rect.y,
            rect.x, rect.y + rect.height,
            rect.x + rect.width, rect.y + rect.height,
            rect.x + rect.width, rect.y
        ];

    
        
        var shape = new cp.PolyShape(this.space.staticBody, verts, cp.vzero);
        shape.setElasticity(1.0);
        shape.setFriction(0.0);
        this.space.addStaticShape(shape);

        this.drawNode.drawRect(cc.p(rect.x, rect.y), cc.p(rect.x + rect.width, rect.y + rect.height), cc.color(255, 0, 0, 255), 1, cc.color(144, 0, 0 ,255));
    },

    addObstacle : function( rect ) {
        var verts = [
            rect.x, rect.y,
            rect.x, rect.y + rect.height,
            rect.x + rect.width, rect.y + rect.height,
            rect.x + rect.width, rect.y
        ];

    
        
        var shape = new cp.PolyShape(this.space.staticBody, verts, cp.vzero);
        shape.setElasticity(1.0);
        shape.setFriction(0.0);
        shape.setCollisionType(4);
        this.space.addStaticShape(shape);

        this.drawNode.drawRect(cc.p(rect.x, rect.y), cc.p(rect.x + rect.width, rect.y + rect.height), cc.color(127, 108, 179, 255), 1, cc.color(127, 108, 179 ,255));
    },

    update:function (dt) {
        // chipmunk step
        this.space.step(1/60);
        this.shapoid.update(dt);
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
