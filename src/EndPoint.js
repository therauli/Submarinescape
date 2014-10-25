var EndPoint = cc.Sprite.extend({
    shape: null,
    ctor: function(staticBody, pos) {
        this._super();
        this.initWithFile(res.end_point_png);
        cc.log('EndPoint', pos);

        var size = this.getContentSize();

        var verts = [pos.x - size.width / 2, pos.y - size.height / 2,
                    pos.x - size.width / 2, pos.y + size.height / 2,
                    pos.x - size.width / 2+ size.width, pos.y + size.height / 2,
                    pos.x + size.width / 2, pos.y - size.height / 2];

        var shape = new cp.PolyShape(staticBody, verts, cp.vzero);
        shape.setCollisionType(3);

        this.setPosition(pos);

        shape.setSensor(true);
        this.shape = shape;
 
    }
});
