// INITIALIZATION
////////////////////////////////////
function initGame() {
    Snake.instance = new Snake('canvas');

    $(document).keydown(function(event) {
        Snake.instance.handleKeyboard(event);
    });

    $('#pauseButton').click(function () {
        Snake.instance.stop();
        $('#playPanel').css('display', 'none');
        $('#pausePanel').css('display', 'block');
    });

    $('#restartAfterPauseButton').click(function () {
        Snake.instance.restart();
        $('#pausePanel').css('display', 'none');
        $('#playPanel').css('display', 'block');
    });

    $('#resumeButton').click(function () {
        Snake.instance.play();
        $('#pausePanel').css('display', 'none');
        $('#playPanel').css('display', 'block');
    });

    $('#restartButton').click(function () {
        Snake.instance.restart();
        $('#restartPanel').css('display', 'none');
        $('#playPanel').css('display', 'block');
    });

    $(function() {
        $.ajax({
                type: "POST",
                url: "/snake_process.php",
                data: "action=init",
                success: function(data) {
                    $('#users tbody').html(data);
                }
            });
    });
    
    Snake.instance.start();
}
////////////////////////////////////

// UTILS
////////////////////////////////////
function Point(x, y) {
    return { x: x, y: y };
}

function Enum() {}
Enum.Direction = { left: 0, right: 1, up: 2, down: 3 };
Enum.Colors = { green: '#0f0', white: '#fff', black: '#000'};
Enum.Keys = { left: 37, right: 39, up: 38, down: 40, a: 65, d: 68, w: 87, s: 83, p: 80, r: 82, space: 32 };
////////////////////////////////////

// SNAKE class definition
////////////////////////////////////
function Snake(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');
    this.squareSize = 10;
    
    var self = this;

    this.play = function() {
        this.interval = setInterval(function() { self.move(); }, this.initialInterval);
        this.running = true;
    };

    this.updateScore = function () {
        this.score = (this.length - 3) * 10;
        var constraint = 150 / this.initialInterval;

        if (constraint < this.score / 150) {
            this.initialInterval *= 2.0 / 3.0;
            this.levelUp();
            clearInterval(this.interval);
            this.interval = setInterval(function () { self.move(); }, this.initialInterval);
        }

        $('#score').html(this.score);
    };
}

Snake.prototype.start = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.position = Point(100, 100);
    this.body = [];
    this.length = 3;
    this.initialInterval = 150;
    this.isGameOver = false;
    this.updateScore();
    this.createFood();
    this.draw();
    this.direction = Enum.Direction.right;
    $("#level").html("1");
    
    this.play();
};

Snake.prototype.restart = function () {
    this.stop();
    this.start();
};

Snake.prototype.stop = function () {
    clearInterval(this.interval);
    this.running = false;
};

Snake.prototype.move = function () {
    switch (this.direction) {
        case Enum.Direction.up:
            this.moveUp();
            break;

        case Enum.Direction.down:
            this.moveDown();
            break;

        case Enum.Direction.left:
            this.moveLeft();
            break;

        case Enum.Direction.right:
            this.moveRight();
            break;
    }
};

Snake.prototype.moveLeft = function () {
    this.position.x -= this.squareSize;
    this.draw();
};

Snake.prototype.moveRight = function () {
    this.position.x += this.squareSize;
    this.draw();
};

Snake.prototype.moveDown = function () {
    this.position.y += this.squareSize;
    this.draw();
};

Snake.prototype.moveUp = function () {
    this.position.y -= this.squareSize;
    this.draw();
};

Snake.prototype.createFood = function() {
    this.foodPosition = Point(this.random(this.canvas.width), this.random(this.canvas.height));

    if (this.body.some(this.hasPoint, this)) {
        this.createFood();
    } else {
        this.context.fillStyle = Enum.Colors.white;
        var apple = new Image();
        apple.src = "apple.png";

        var that = this;
        apple.onload = function() {
            that.context.drawImage(apple, that.foodPosition.x, that.foodPosition.y, 10, 10);
        };
    };
};

Snake.prototype.random = function (value) {
    return Math.floor(Math.random() * (value / this.squareSize)) * this.squareSize;
};

Snake.prototype.hasPoint = function (element) {
    return (element.x == this.foodPosition.x && element.y == this.foodPosition.y);
};

Snake.prototype.hasEatenItself = function (element) {
    return (element.x == this.position.x && element.y == this.position.y);
};

Snake.prototype.gameOver = function () {
    this.stop();
    $('#playPanel').css('display', 'none');
    $('#restartPanel').css('display', 'block');

    var lastScore = $('td#lastScore');
    var lastScoreVal = parseInt(lastScore.html());

    var score = $('#score').html();
    var scoreVal = parseInt(score);

    if (scoreVal > lastScoreVal)
        this.showResult();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.isGameOver = true;
};

Snake.prototype.showResult = function () {

    // a workaround for a flaw in the demo system (http://dev.jqueryui.com/ticket/4375), ignore!
    $("#dialog:ui-dialog").dialog("destroy");

    var name = $("#name"),
        score = $('#score'),
        tips = $(".validateTips"),
        message = $('#dialogMessage');

    function updateTips(t) {
        tips
            .text(t)
            .addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    function checkLength(o, n, min, max) {
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            updateTips("Length of " + n + " must be between " +
                min + " and " + max + ".");
            return false;
        } else {
            return true;
        }
    }

    function checkRegexp(o, regexp, n) {
        if (!(regexp.test(o.val()))) {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        } else {
            return true;
        }
    }

    function updateHighscore() {
        $.ajax({
            type: "POST",
            url: "/snake_process.php",
            data: "action=process&name=" + name.val() + "&score=" + score.html(),
            success: function (data) {
                $('#users tbody').html(data);
            }
        });
    }

    $("#dialog-modal").dialog({
        modal: true,
        resizable: false,
        buttons: {
            Save: function () {
                var isValid = true;
                name.removeClass("ui-state-error");

                isValid = isValid &&
                        checkLength(name, "username", 3, 14);

                isValid = isValid &&
                        checkRegexp(name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter.");

                if (isValid) {
                    updateHighscore();
                    message.html("Name is required.");
                    $(this).dialog("close");
                }
            },
            Cancel: function () {
                message.html("Name is required.");
                $(this).dialog("close");
            }
        }
    });
};

Snake.prototype.isOutOfBoard = function () {
    return this.position.x < 0 || this.position.x > 600
        || this.position.y < 0 || this.position.y > 600;
};

Snake.prototype.draw = function () {
    if (this.isOutOfBoard() || this.body.some(this.hasEatenItself, this)) {
        this.gameOver();
        return;
    }

    this.body.push(Point(this.position.x, this.position.y));

    this.context.fillStyle = Enum.Colors.green;
    this.context.fillRect(this.position.x, this.position.y, this.squareSize, this.squareSize);

    if (this.body.length > this.length) {
        var itemToRemove = this.body.shift();
        this.context.clearRect(itemToRemove.x, itemToRemove.y, 10, 10);
    }

    if (this.position.x == this.foodPosition.x && this.position.y == this.foodPosition.y) {
        this.createFood();
        this.length += 1;
        this.updateScore();
    }
};

Snake.prototype.levelUp = function() {
    var spanLevel = $("#level");
    var level = parseInt(spanLevel.html());
    spanLevel.html(level + 1);
};

Snake.prototype.handleKeyboard = function (event) {
    switch (event.keyCode) {
        case Enum.Keys.left:
        case Enum.Keys.a:
            if (this.running && this.direction != Enum.Direction.right) {
                this.direction = Enum.Direction.left;
                this.moveLeft();
            }
            break;
        case Enum.Keys.up:
        case Enum.Keys.w:
            if (this.running && this.direction != Enum.Direction.down) {
                this.direction = Enum.Direction.up;
                this.moveUp();
            }
            break;
        case Enum.Keys.right:
        case Enum.Keys.d:
            if (this.running && this.direction != Enum.Direction.left) {
                this.direction = Enum.Direction.right;
                this.moveRight();
            }
            break;
        case Enum.Keys.down:
        case Enum.Keys.s:
            if (this.running && this.direction != Enum.Direction.up) {
                this.direction = Enum.Direction.down;
                this.moveDown();
            }
            break;
        case Enum.Keys.p:
        case Enum.Keys.space:
            if (this.isGameOver)
                return;
            
            this.running ? $('#pauseButton').click() : $('#resumeButton').click();
            break;
        case Enum.Keys.r:
            if (this.running)
                return;
            this.isGameOver ? $('#restartButton').click() : $('#restartAfterPauseButton').click();
            break;
        default:
            break;
    }
};
////////////////////////////////////
