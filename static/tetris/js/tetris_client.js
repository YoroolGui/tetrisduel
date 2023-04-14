class TetrisClient {
    ctx;
    url;
    sse;

    // Contructor accepts canvas
    constructor(canvas, url) {
        // Set canvas
        this.canvas = canvas;
        // Get context
        this.ctx = canvas.getContext('2d');
        this.url = url;
    }

    connect() {
        // Connect to server
        this.sse = new EventSource(this.url);
        this.sse.addEventListener('message', (event) => {
            var data = JSON.parse(event.data);
            console.log(data.width, data.height);
        });
    }

    // Commands to send to server (to be implemented later)
    moveLeft() {
        console.log('moveLeft');
    }

    moveRight() {
        console.log('moveRight');
    }

    rotateLeft() {
        console.log('rotateLeft');
    }

    rotateRight() {
        console.log('rotateRight');
    }

    drop() {
        console.log('drop');
    }

    down() {
        console.log('down');
    }

    bindButtons(left_id, rotate_left_id, down_id, rotate_right_id, right_id) {
        var self = this;
        document.getElementById(left_id).onclick = function () {
            self.moveLeft();
        }
        document.getElementById(rotate_left_id).onclick = function () {
            self.rotateLeft();
        }
        document.getElementById(down_id).onclick = function () {
            self.down();
        }
        document.getElementById(rotate_right_id).onclick = function () {
            self.rotateRight();
        }
        document.getElementById(right_id).onclick = function () {
            self.moveRight();
        }
    }

    bindKeys() {
        var self = this;
        document.onkeydown = (event) => {
            event.preventDefault();
            event.stopPropagation();
            switch (event.key) {
                case "ArrowLeft":
                case "a":
                    self.moveLeft();
                    break;
                case "ArrowUp":
                case "w":
                    self.rotateLeft();
                    break;
                case "ArrowRight":
                case "d":
                    self.moveRight();
                    break;
                case "ArrowDown":
                case "s":
                    self.down();
                    break;
                case " ":
                    self.drop();
                    break;
            }
        }
    }
}
