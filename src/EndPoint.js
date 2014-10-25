var EndPoint = cc.PhysicsSprite.extend({
    shape: null,
    ctor: function(staticBody, pos) {
        this._super();
        this.initWithFile(res.end_point_png);
        cc.log('EndPoint', pos);

        this.setBody(staticBody);    

        this.setPosition(pos);
        
        var size = this.getContentSize();

        var rect = cc.rect(pos.x, pos.y, size.width, size.height);

        var shape = new cp.BoxShape(staticBody, rect.width, rect.height);
        shape.setCollisionType(3);

        shape.setSensor(true);
        this.shape = shape;
 
    }
});
