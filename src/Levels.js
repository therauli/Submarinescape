var levels = [{	"name": "level1",
				"start": cc.p(100, 200),
				"end": cc.p(700,100),
				"platforms": [
					cc.rect(0,50,200,10), // starting platform
					cc.rect(0,50,10,700), // left wall
					cc.rect(0,440,800,10), // ceiling
					cc.rect(790,50,10,750), // right wall
					cc.rect(250,50,300,10), // middle platform
					cc.rect(600,50,200,10)  // end platform
				]

			  },
			  { "name": "level2",
			    "start": cc.p(100, 200),
			    "end": cc.p(700, 100),
			    "platforms" : [
			  		cc.rect(0,50,800,10), // floor
					cc.rect(0,50,10,700), // left wall
					cc.rect(0,440,800,10), // ceiling
					cc.rect(790,50,10,750) // right wall					
			  	],
			    "obstacles": [
			  		cc.p(415,150)
			    ],
			  	"sugar" : cc.p(300,80)
			  }
			 ];
