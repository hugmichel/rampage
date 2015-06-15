var Rampage = {};
Rampage.Building = function () {

};
Rampage.Building.prototype = {
  buildingGroup: null,
  create: function (game, xRoot, yRoot, width, height) {

    // -- buildings
    this.buildingGroup = game.add.group();
    this.buildingGroup.enableBody = true;

    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var buildingPart = this.buildingGroup.create(xRoot + (50 * x),
                                                     yRoot - (50 * y),
                                                     'ground');
        buildingPart.height = 50;
        buildingPart.width = 50;
        buildingPart.body.gravity.y = 100;
      }
//        var buildingPart = this.platforms.create(100 + (10 * x) + (50 * x),
//                                                 this.game.world.height - 64 - (10 * y) - (50 * y),
//                                                 'ground');
//        buildingPart.height = 10;
//        buildingPart.width = 50;
//        buildingPart.body.gravity.y = 100;
//        buildingPart.body.immovable = true;
//        this.platforms.push(buildingPart);
    }
    game.physics.arcade.enable(this.buildingGroup);

  },
  update: function (game) {

    game.physics.arcade.collide(this.buildingGroup, this.buildingGroup);
  }
};
Rampage.Player = function () {
  this.isJumping = false;
  this.isStriking = false;
  this.isBuildingSnapped = false;
};
Rampage.Player.prototype = {
  sprite: null,
  playerGroup: null,
  strikePoint: null,

  isJumping: false,
  isStriking: false,
  isBuildingSnapped: false,

  jump: function () {

  },
  strike: function (buildings) {
    this.isStriking = true;
    game.physics.arcade.overlap(this.strikePoint, buildings, function (star, building) {
      building.tint -= 0x111111;
      if (building.tint < 0x111111) {
        building.tint = 0;
      }
    }, null, this);


  },
  move: function (direction, scale) {
    this.sprite.body.velocity.x = direction;
    this.sprite.animations.play('move');
    this.sprite.scale.x = scale;
  },
  create: function (game, x, y) {
    this.sprite = game.add.sprite(x, y, 'george');
    this.sprite.anchor.x = 0.5;
    this.sprite.animations.add('move', georgeSprite.WALK, 10, true);

    game.physics.arcade.enable(this.sprite);
    this.sprite.body.gravity.y = 1000;
    this.sprite.body.collideWorldBounds = true;

    this.playerGroup = game.add.group();
    this.playerGroup.enableBody = true;
    this.strikePoint = this.playerGroup.create(x + 80, y - 80, 'star');
  },
  update: function (game, cursors, buildings) {
    game.debug.body(this.sprite);
    this.strikePoint.x = this.sprite.x + 35;
    this.strikePoint.y = this.sprite.y + 55;

    this.isBuildingSnapped = false;
    this.isStriking = false;
    this.isJumping = false;
    this.buildingSnappeds = [];
    for (var i = 0; i < buildings.length; i++) {
      game.physics.arcade.overlap(this.sprite, buildings[i].buildingGroup, this.playerSnapBuilding, null, this);
      //if (this.isBuildingSnapped) {
      //  break;
      //}
    }
//      if(this.sprite.body.velocity.y != 0)

    this.sprite.body.velocity.x = 0;
    this.sprite.body.allowGravity = true;

    if (cursors.left.isDown) {
      this.move(-300, -1);
    }
    else if (cursors.right.isDown) {
      this.move(300, 1);
    }

    if (cursors.spacebar.isDown) {
      this.strike(buildings[0].buildingGroup);
    }

    var action = 'STAND';
    var lookDirection = 'SIDE';

    var controlMode = 'ground';
    var isOnRoof = false;

    if (this.buildingSnappeds.length == 2) {
      var notOnRoof = true;
      for (var i = 0; i < this.buildingSnappeds.length; i++) {
        var SpriteAboveBuildingOffset = (this.sprite.y + this.sprite.height) - this.buildingSnappeds[i].y;
        console.log(SpriteAboveBuildingOffset);
        if (SpriteAboveBuildingOffset < 5) {
          notOnRoof = false;
        }
      }
      if (!notOnRoof) {
        isOnRoof = true;
      }
    }

    if (this.isBuildingSnapped) {
      controlMode = 'buildingSnapped';
    }
    if (controlMode == 'buildingSnapped' || isOnRoof) {
      this.sprite.body.allowGravity = false;
      this.sprite.body.velocity.y = 0;


      if (cursors.up.isDown && !isOnRoof) {
        this.sprite.body.velocity.y = -300;
      }
      else if (cursors.down.isDown) {
        this.sprite.body.velocity.y = 300;
      }
      action = 'CLIMB';
      if (isOnRoof) {
        action = 'STAND';
        controlMode = 'ground';
      }

    }


    if (controlMode == 'ground') {

      //  Allow the this.sprite to jump if they are touching the ground.
      if (cursors.jump.isDown && (this.sprite.body.touching.down || isOnRoof)) {
        this.sprite.body.velocity.y = -350;
      }
      if (cursors.down.isDown) {
        lookDirection = 'DOWN';
      }
      else if (cursors.up.isDown) {
        lookDirection = 'UP';
      }
      if (!this.sprite.body.touching.down && !isOnRoof) {
        action = 'JUMP';
      }
    }
    var frame = action + '_' + lookDirection;
    if (this.isStriking) {
      frame += '_STRIKE';
    }
    this.frame(georgeSprite[frame]);
  },
  frame: function (frame) {
    if (frame == georgeSprite.MOVE) {
      this.sprite.animations.play('move');
    }
    else {
      this.sprite.animations.stop();            // -- add one player

      this.sprite.frame = frame;
    }

  },
  playerSnapBuilding: function (player, building) {
//      if(building.isRoof)return;
    this.isBuildingSnapped = true;
    this.buildingSnappeds.push(building);

  }

};
Rampage.Player.preload = function () {
  game.load.spritesheet('george', 'assets/rampage.png', 114, 135);
  game.load.image('star', 'assets/star.png');
};
Rampage.Game = function () {
  this.players = [];
  this.buildings = [];
};
Rampage.Game.prototype = {
  game: null,

  platforms: null,
  buildings: null,
  buildingsRoof: null,
  cursors: null,
  stars: null,
  score: 0,
  scoreText: null,
  _star: null,

  preload: function () {
    this.game.load.image('sky', 'assets/sky.png');
    this.game.load.image('ground', 'assets/platform.png');
    Rampage.Player.preload();

    this.game.load.image('star', 'assets/star.png');
  },
  create: function () {
    this.buildingsRoof = [];
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.cursors.jump = this.game.input.keyboard.addKey(Phaser.Keyboard.X);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.add.sprite(0, 0, 'sky');

    // -- ground
    this.platforms = this.game.add.group();
    this.platforms.enableBody = true;
    var ground = this.platforms.create(0, this.game.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;


    for(var i =0; i<3;  i++) {
      this.addBuilding(100 + i*200, 2 + i);
    }
    this.addPlayer();
  },
  update: function () {
    this.game.physics.arcade.collide(this.players[0].sprite, this.platforms);
//      this.game.physics.arcade.collide(this.buildings, this.buildings);

    for (var i = 0; i < this.buildings.length; i++) {
      this.buildings[i].update(this.game);
      this.game.physics.arcade.collide(this.buildings[i].buildingGroup, this.platforms);
    }
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].update(this.game, this.cursors, this.buildings);
    }
  },
  addPlayer: function(){
    var player = new Rampage.Player();
    player.create(this.game, 200, this.game.world.height - 200);
    this.players.push(player);
  },
  addBuilding: function(x, height){
    var building = new Rampage.Building();
    building.create(this.game, x, this.game.world.height - 64 - 50, 2, height);
    this.buildings.push(building);
  }
};
