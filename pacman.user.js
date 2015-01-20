// ==UserScript==
// @name          PacPro
// @namespace     http://*.koalabeast.com:*
// @version       3.0.2
// @description   Pacman mod and texture pack
// @copyright     2015+, moose.
// @require       https://gist.githubusercontent.com/SomeBall-1/80320c9db3e1146c0a66/raw/TagPro%20Texture%20Refresh.js
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @include       *tagproandluckyspammersucksandunfortunatesniperisawesome.com:*
// ==/UserScript==

// TILES
var TilesWithChars = "http://i.imgur.com/n9cuDEc.png";
var TilesRegular = "http://i.imgur.com/POidLTd.png";
var TilesSwapped = "http://i.imgur.com/cQRMUDi.png";
var SpeedPad = "http://i.imgur.com/xNYdOYD.png";
var SpeedPadRed = "http://i.imgur.com/2pbrSjq.png";
var SpeedPadBlue = "http://i.imgur.com/tbz0xgb.png";
var Portal = "http://i.imgur.com/a0JUw8q.png";
var BallPopRed = "http://i.imgur.com/31srn9r.png";
var BallPopBlue = "http://i.imgur.com/HGvXAsC.png";
var PacmanCircle = "http://i.imgur.com/nvo2Vzo.png";
//Textures
var PACTOP = new PIXI.Texture.fromImage("http://i.imgur.com/ovzoHNE.png");
var PACBOT = new PIXI.Texture.fromImage("http://i.imgur.com/gIAt7wD.png");
var BLUEGHOST = new PIXI.Texture.fromImage("http://i.imgur.com/uQC5eVO.png");
var REDGHOST = new PIXI.Texture.fromImage("http://i.imgur.com/dvd3kh4.png");
var GHOST_TAGPRO = new PIXI.Texture.fromImage("http://i.imgur.com/K1pVpvO.png");
//Constants
var MOUTH_MAX = 15;
var MOUTH_MAX_JJ = 8;
//Audio
var PacmanStart = new Audio("https://clyp.it/gmk34qew.mp3");
var PacmanDeath = new Audio("https://clyp.it/wcg5vuv4.mp3");

//Globals
teamColor = 'blue';
tagpro.switchedColors = false;
colorId = {red:1, blue:2};
teamId = 0;
document.getElementById("particle").src = PacmanCircle;

tagpro.ready(function()
{
    document.getElementById("tiles").src = TilesRegular;
    document.getElementById("speedpad").src = SpeedPad;
    document.getElementById("speedpadred").src = SpeedPadRed;
    document.getElementById("speedpadblue").src = SpeedPadBlue;
    document.getElementById("portal").src = Portal;
    document.getElementById("ballpopred").src = BallPopRed;
    document.getElementById("ballpopblue").src = BallPopBlue;

    checkTeam();
    tr = tagpro.renderer;
    
    if (tagpro.sound) {
        tagpro.musicPlayer.mute()
        PacmanStart.play();
        setTimeout(tagpro.musicPlayer.next, 5000)
    }

    // Creates the Pacman sprite
    tr.createPacman = function(player) {
        // If player switched team, remove the ghost sprite
        if (player.sprites.ghost)
        {
            player.sprites.ball.removeChild(player.sprites.ghost);
            player.sprites.ghost = null;
        }

        // Create sprite, center it onto ball
        var pacTop = new PIXI.Sprite(PACTOP);
        var pacBot = new PIXI.Sprite(PACBOT);
        pacTop.anchor = new PIXI.Point(.5, .5);
        pacBot.anchor = new PIXI.Point(.5, .5);
        pacTop.x = 20;
        pacTop.y = 20;
        pacBot.x = 20;
        pacBot.y = 20;
        
        // Initialize the mouth to open and all parameters
        pacTop.rotation = Math.atan2(-1,1);
        pacBot.rotation = Math.atan2(1,1);
        
        pacTop.mouthPos = MOUTH_MAX;
        pacTop.mouthMax = MOUTH_MAX;
        pacTop.closing = true;
        pacTop.flipped = false;

        player.sprites.pacTop = pacTop;
        player.sprites.pacBot = pacBot;
        player.sprites.ball.addChild(player.sprites.pacTop);
        player.sprites.ball.addChild(player.sprites.pacBot);
    }

    // Updates the Pacman sprite.  This includes opening/closing the mouth,
    // flipping directions, and handling the jukejuice mouth speed increase
    tr.updatePacman = function(player) {
        if(player.dead) return;
        //lx negative = left 
        //lx positive = right
        s = player.sprites;

        // Check if pacman needs to be flipped
        if (((player.lx < 0) && !s.pacTop.flipped) || ((player.lx > 0) && s.pacTop.flipped))
        {
            s.pacTop.scale.x *= -1;
            s.pacBot.scale.x *= -1;
            s.pacTop.flipped = !s.pacTop.flipped;
        }

        // Update the mouth speed depending if player has jukejuice/grip
        if (player.grip && s.pacTop.mouthMax != MOUTH_MAX_JJ)
        {
            s.pacTop.mouthMax = MOUTH_MAX_JJ;
            //If the current pos is greater than the max, reset it to the new max
            if (s.pacTop.mouthPos >= MOUTH_MAX_JJ)
            {
                s.pacTop.mouthPos = MOUTH_MAX_JJ;
                s.pacTop.closing = true;
            }
        }
        else if (!player.grip && s.pacTop.mouthMax != MOUTH_MAX)
        {
            // No longer has juke juice, reset the mouth
            s.pacTop.mouthMax = MOUTH_MAX;
        }

        //Calculations to figure out the position of the mouth
        var mouthCenter = s.pacTop.flipped ? (Math.PI/4) : 0;
        s.pacTop.rotation = Math.atan2(-1, 1) * (s.pacTop.mouthPos)/s.pacTop.mouthMax + mouthCenter;
        s.pacBot.rotation = Math.atan2(1, 1) * (s.pacTop.mouthPos)/s.pacTop.mouthMax - mouthCenter;
        
        // Decrement/increment the mouth position
        if(s.pacTop.closing)
        {
            s.pacTop.mouthPos--;
            if (s.pacTop.mouthPos <= 0)
            {
                s.pacTop.closing = false;
            }
        }
        else
        {
            s.pacTop.mouthPos++;
            if (s.pacTop.mouthPos >= s.pacTop.mouthMax)
            {
                s.pacTop.closing = true;
            }
        }
    }
    
    // Creates the Ghost sprite
    tr.createGhost = function(player) {

        //Player switched teams, remove the pacman sprite
        if (player.sprites.pacTop)
        {
            player.sprites.ball.removeChild(player.sprites.pacTop);
            player.sprites.ball.removeChild(player.sprites.pacBot);
            player.sprites.pacTop = null;
            player.sprites.pacBot = null;
        }

        var ghost = new PIXI.Sprite(REDGHOST);
        ghost.anchor = new PIXI.Point(.5, .5);
        ghost.x = 20;
        ghost.y = 20;
        ghost.blue = false;
        player.sprites.ghost = ghost;
        player.sprites.ball.addChild(player.sprites.ghost);

        // Create the eyes.  These are plain black 3px radius circles
        var ghostLeftEye = new PIXI.Graphics;
        player.sprites.ghostLeftEye = ghostLeftEye;
        ghostLeftEye.beginFill(0, 1).drawCircle(11, 13, 3);
        player.sprites.ball.addChild(ghostLeftEye);

        var ghostRightEye = new PIXI.Graphics;
        player.sprites.ghostRightEye = ghostRightEye;
        ghostRightEye.beginFill(0, 1).drawCircle(23, 13, 3);
        player.sprites.ball.addChild(ghostRightEye);
    }

    // Updates the Ghost sprite.  This includes changing ghost color to blue
    // When you have the tagpro, and moving the eyes based on current direction
    // Traveling
    tr.updateGhost = function(player){
        
        // Check if you have tagpro.  If so, turn all enemy ghosts blue
        if(tagpro.players[tagpro.playerId].tagpro && !player.sprites.ghost.blue)
        {
            player.sprites.ghost.texture = BLUEGHOST;
            player.sprites.ghost.blue = true;
        }
        else if(!tagpro.players[tagpro.playerId].tagpro && player.sprites.ghost.blue)
        {
            player.sprites.ghost.texture = REDGHOST;
            player.sprites.ghost.blue = false;
        }

        var leftEye;
        var rightEye;
        // Determine the direction traveliing in terms of the 8 cardinal directions
        // This is done by taking the arctan of the current direction and rounding to the nearest 0.25
        var direction = Math.atan2(player.lx, player.ly)/Math.PI;
        direction = Math.round(direction * 4)/4;
        //TODO: Clean up and make pretty
        // Point Values are based on relative coordinates to the 40x40 box that the ball is contained in
        if ((player.lx == 0) && (player.ly == 0))
        {
            leftEye = new PIXI.Point(11,13);    
            rightEye = new PIXI.Point(23,13);
        }
        else if (direction == -0.75)// up left
        {
            leftEye = new PIXI.Point(10,11);    
            rightEye = new PIXI.Point(22,11);
        }
        else if (direction == -0.25)// down left
        {
            leftEye = new PIXI.Point(10,15);    
            rightEye = new PIXI.Point(22,15);
        }
        
        else if (direction == 0.75)// up right
        {
            leftEye = new PIXI.Point(12,11);
            rightEye = new PIXI.Point(24,11);
        }
        else if (direction == 0.25)// down right
        {
            
            leftEye = new PIXI.Point(12,15);    
            rightEye = new PIXI.Point(24,15);
        }
        else if(direction == -0.5)// left
        {
            leftEye = new PIXI.Point(10, 13);
            rightEye = new PIXI.Point(22,13);
        }
        else if (direction == 0.5)// right
        {
            leftEye = new PIXI.Point(12,13);    
            rightEye = new PIXI.Point(24,13);
        }
        else if ((direction == 1) || (direction == -1))// up
        {
            leftEye = new PIXI.Point(11,10);    
            rightEye = new PIXI.Point(23,10);
        }
        else if (direction == 0)// down
        {
            leftEye = new PIXI.Point(11,16);    
            rightEye = new PIXI.Point(23,16);
        }

        // Adjustments to center, not sure why exactly
        leftEye.x -= 8;
        leftEye.y -= 13;
        rightEye.x -= 20;
        rightEye.y -= 13;
        // Update the positions
        player.sprites.ghostLeftEye.position = leftEye;
        player.sprites.ghostRightEye.position = rightEye;
    }
    
    // Creates and updates both pacman and ghost sprites
    var prevUpdateSprites = tr.updatePlayerSpritePosition;
    tr.updatePlayerSpritePosition = function (player) {
        var selfPlayer = tagpro.players[tagpro.playerId];
        
        //*************** CREATE PACMAN *********************//
        if(!player.sprites.pacBot && player.team === selfPlayer.team)
        {
            tr.createPacman(player);
        }
        
        //*************** CREATE GHOST *********************//
        if(!player.sprites.ghost && player.team != selfPlayer.team)
        {
            tr.createGhost(player);
        }
        
        //*************** UPDATE PACMAN OR GHOST *********************//
        if(player.team === selfPlayer.team)
        {
            tr.updatePacman(player);
        }
        else
        {
            tr.updateGhost(player);
        }
        
        // Continue with the previously defined function
        prevUpdateSprites(player);
    };

    // Updates the tagpro ring.  This is modified from the source code to 
    // encompass the whole ghost and also to thin the green ring round pacman (from 3px down to 2px)
    tr.updateTagpro = function (e) {
        if (e.tagpro) {
            if (!e.sprites.tagproTint) {
                if (e.sprites.ghost)
                {
                    var t = e.sprites.tagproTint = new PIXI.Sprite(GHOST_TAGPRO);
                    e.sprites.ball.addChild(t);
                }
                else
                {
                    var t = e.sprites.tagproTint = new PIXI.Graphics;
                    t.beginFill(65280, .2).lineStyle(2, 65280).drawCircle(20, 20, 19), 
                        e.sprites.ball.addChild(t);
                }
            }
        } else {
            e.sprites.tagproTint && (e.sprites.ball.removeChild(e.sprites.tagproTint), e.sprites.tagproTint = null);
            if (e.sprites.tagproSparks) {
                e.sprites.tagproSparks.emit = !1;
                var r = n.emitters.indexOf(e.sprites.tagproSparks);
                n.emitters.splice(r, 1), e.sprites.tagproSparks.destroy(), e.sprites.tagproSparks = null
            }
        }
    };

    // Sets the scores down below to Pacman vs. Ghost and changes the color to yellow vs red respectively
    tagpro.ui.scores = function() {
        var e = "", //redScoreString
            t = ""; //blueScoreString
        e = tagpro.switchedColors ? "Pacman - " : "Ghost - ";
        t = tagpro.switchedColors ? " - Ghost" : " - Pacman";

        var n = e + (tagpro.score.r ? tagpro.score.r.toString() : "0"),
            r = (tagpro.score.b ? tagpro.score.b.toString() : "0") + t;
        tagpro.ui.sprites.redScore ? (tagpro.ui.sprites.redScore.text != n && tagpro.ui.sprites.redScore.setText(n), tagpro.ui.sprites.blueScore != r && tagpro.ui.sprites.blueScore.setText(r)) : (tagpro.ui.sprites.redScore = new PIXI.Text(n, {
            fill: tagpro.switchedColors ? "#FFFF00" : "#FF0000",
            font: "bold 32pt Arial"
        }), tagpro.ui.sprites.blueScore = new PIXI.Text(r, {
            fill: tagpro.switchedColors ? "#FF0000" : "#FFFF00",
            font: "bold 32pt Arial"
        }), tagpro.ui.sprites.redScore.alpha = .5, tagpro.ui.sprites.blueScore.alpha = .5, 
        tagpro.ui.sprites.redScore.anchor.x = 1, tagpro.ui.sprites.blueScore.anchor.x = 0, 
        tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.redScore), 
        tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.blueScore));
    };

    // Displays the correct winner at the end of the game depending if teams had to be swapped
    tagpro.ui.largeAlert = function(e, t, n, r, i) {
        if (r.indexOf("Wins!") > -1)
        {
            if ((tagpro.winner == "red") || ((tagpro.winner == "blue") && tagpro.switchedColors))
            {
                r = "Ghosts Win!";
                i = "#FF0000";
            }
            else
            {
                r = "Pacman Wins!";
                i = "#FFFF00";
            }
        }

        var s = tagpro.renderer.largeText(r, i);
        return s.x = Math.round(t.x - s.width / 2), s.y = 100, e.addChild(s), s
    };

    tr.createPlayerEmitter = function(e) {
        if (tr.options.disableParticles) return;
        e.sprites.emitter = new cloudkid.Emitter(tr.layers.midground, [tr.particleTexture], tagpro.particleDefinitions.playerEmitter), e.sprites.emitter.keep = !0, tr.emitters.push(e.sprites.emitter), e.sprites.emitter.emit = !1
    }

    // Overrides the default pop animation to display the drawBallPop function.  Also does not draw splats
    tr.drawSplat = function(e, t, r, i, s) {
        tr.drawBallPop(e + 19, t + 19, r);
    }

    // Overriding the default pop animation to the previous MovieClip.
    // Ghost death animation: eyes getting larger and moving upwards
    // Pacman death animation: Pieces of pacman getting chipped away
    tr.drawBallPop = function(e, t, r) {
        var i = r == 1 ? "ballpopred" : "ballpopblue",
            s = new PIXI.MovieClip(tagpro.tiles[i].textures);
        s.playing = !0, s.loop = !1, s.x = e, s.y = t, s.animationSpeed = .35;
        var o = 1;
        s.updateTransform = function() {
            s.scale = new PIXI.Point(o, o), s.x = e - o * 19, s.y = t - o * 19, s.alpha = 1 / (o / 2), o += .15, PIXI.MovieClip.prototype.updateTransform.call(s)
        }, tr.layers.foreground.addChild(s), s.onComplete = function() {
            setTimeout(function() {
                s.parent.removeChild(s)
            }, 0)
        }
    }

    // Initial function to determine whether or not to swap the tiles based on the team assigned.
    // The pacman team is defaulted to blue, so if the player is assigned red, the tiles need to be swapped
    function checkTeam() {
        //wait until you'be been assigned to a team and the tiles have been loaded. 
        if (!tagpro.players[tagpro.playerId] | !tagpro.tiles) {
            return setTimeout(checkTeam,0);
        }

        //if the team color you've been assigned to is different from your preference, switch team colored tiles
        teamId = tagpro.players[tagpro.playerId].team;
        if (teamId  != colorId[teamColor]) {
            tagpro.switchedColors = true;
            switchTiles();

        }
        setTimeout(checkSwitchTeam, 5000);
    }

    // Periodic function to check whether you have switched teams.  If so, switch the tiles to keep colors consistend
    function checkSwitchTeam(){
        if (teamId != tagpro.players[tagpro.playerId].team)
        {
            teamId = tagpro.players[tagpro.playerId].team;
            tagpro.switchedColors = !tagpro.switchedColors;
            switchTiles();
        }
        setTimeout(checkSwitchTeam, 1000);
    }

    // Swaps the speed pads, death animations, and tile images to keep the player on the consistent color team
    function switchTiles() {
        rspeed = document.getElementById("speedpadred").src;
        document.getElementById("speedpadred").src = document.getElementById("speedpadblue").src;
        document.getElementById("speedpadblue").src = rspeed;

        rpop = document.getElementById("ballpopred").src;
        document.getElementById("ballpopred").src = document.getElementById("ballpopblue").src;
        document.getElementById("ballpopblue").src = rpop;

        if (tagpro.switchedColors)
        {
            document.getElementById("tiles").src = TilesSwapped;
        }
        else
        {
            document.getElementById("tiles").src = TilesRegular;
        }

        // Force a redraw of the scores
        tagpro.renderer.layers.ui.removeChild(tagpro.ui.sprites.redScore);
        tagpro.renderer.layers.ui.removeChild(tagpro.ui.sprites.blueScore);
        tagpro.ui.sprites.redScore = null;
        tagpro.ui.sprites.blueScore = null;

        setTimeout(refreshTextures, 100);
    }

    // Function to refresh the map. Thanks to CFlakes and Some Ball -1 for implementing this
    function refreshTextures() {
        if (!tagpro.renderer.refresh) {
            return setTimeout(refreshTextures, 10);
        }
        window.requestAnimationFrame(tagpro.renderer.refresh);
    }

    tagpro.particleDefinitions.playerEmitter =
    {
        alpha: {
            start: 1,
            end: .3
        },
        scale: {
            start: 1,
            end: 1,
            minimumScaleMultiplier: 1
        },
        color: {
            start: "0xffffff",
            end: "0xffffff"
        },
        speed: {
            start: 0,
            end: 0
        },
        acceleration: {
            x: 0,
            y: 0
        },
        startRotation: {
            min: 0,
            max: 0
        },
        rotationSpeed: {
            min: 0,
            max: 0
        },
        lifetime: {
            min: 1,
            max: 1
        },
        blendMode: "normal",
        frequency: .2,
        emitterLifetime: -1,
        maxParticles: 50,
        pos: {
            x: 20,
            y: 20
        },
        addAtBack: false,
        spawnType: "point"
    }
});
