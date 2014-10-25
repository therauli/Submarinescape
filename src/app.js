
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
        this.currentLevel = 0;
        this.sprite = new cc.Sprite(res.bacground_png);
        this.addChild(this.sprite, 0);
        this.sprite.setOpacity( 150 );
        this.sprite.setPosition(size.width / 2,
                                size.height / 2 );

        cc.log('whee');

        this.drawNode = new cc.DrawNode();
        this.addChild(this.drawNode, 50);
        
        this.initPhysics(size);
        this.scheduleUpdate();
        
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

        this.loadLevel( this.currentLevel );
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

        // collisionhandler        
        space.addCollisionHandler(1, 2, this.collisionBottomBegin, null, null, null);

        // debug stuph
        this._debugNode = new cc.PhysicsDebugNode(space);
        this._debugNode.visible = true; //set this 
        this.addChild(this._debugNode, 1000);

        space.addCollisionHandler(1, 3, this.collisionEndBegin, null, null, null);

    },

    loadLevel : function( lvl )
    {
        this.shapoid = new Shapoid();
        this.addChildPhysics(this.shapoid, 10);
        this.resetShapoid();

        // Setup platforms
        for( var i = 0; i < levels[lvl]["platforms"].length; i++ ){
            this.addPlatform( levels[lvl]["platforms"][i] )

        }
        cc.log('Platforms, done');

        // setup obstacles if any        
        if( levels[lvl]["obstacles"] !== undefined ) {        
            for( var i = 0; i < levels[lvl]["obstacles"].length; i++ ){
                this.addObstacle( levels[lvl]["obstacles"][i] )
            }
        }
        cc.log('Obstacles, done');

        // endpoint
        this.endPoint = levels[this.currentLevel]["end"]; 
        var endPoint = new EndPoint(this.space.staticBody, this.endPoint);
        space.addStaticShape(endPoint.shape);
        this.addChild(endPoint, 10);
    },

    resetShapoid : function ()
    {
        this.startPoint = levels[this.currentLevel]["start"];
        this.shapoid.setPosition(this.startPoint);
        this.shapoid.getBody().resetForces();

    },

    collisionBottomBegin : function(arbiter, space) {
        this.resetShapoid();
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
