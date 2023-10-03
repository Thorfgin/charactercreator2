function Stone(options) {
    this.options = Object.assign({}, {
        imageSprite: './images/pentagon-sprite.gif',
        stoneWidth: 99,
        stoneHeight: 99,
    }, options);

    this.stone = null;

    this.initialize = function () {
        this.makeStone();
    };

    this.makeStone = function () {
        this.stone = document.createElement('img');
        this.stone.className = 'stone';
        this.stone.src = this.options.imageSprite;
        this.stone.style.width = this.options.stoneWidth + 'px';
        this.stone.style.height = this.options.stoneHeight + 'px';
        this.stone.style.position = 'fixed';
        this.stone.style.zIndex = '99999999';

        // Set stone position based on window size
        var windowX = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var windowY = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        this.stone.style.top = Math.round(windowY * this.options.pos.y) + 'px';
        this.stone.style.left = Math.round(windowX * this.options.pos.x) + 'px';

        document.body.appendChild(this.stone);
    };

    this.remove = function () {
        if (this.stone && this.stone.parentNode) {
            this.stone.parentNode.removeChild(this.stone);
        }
    };

    this.initialize();
}

function StoneDispatch(options) {
    this.id = "pentagon-stone";
    this.stones = [];

    this.initialize = function () {
        var posStone = [
            { x: 0.45, y: 0.25 },
            { x: 0.55, y: 0.25 },
            { x: 0.40, y: 0.35 },
            { x: 0.60, y: 0.35 },
            { x: 0.5, y: 0.45 },
        ];

        posStone.forEach(function (pos) {
            var stoneOptions = Object.assign({}, options);
            stoneOptions.pos = pos;
            var stone = new Stone(stoneOptions);
            this.stones.push(stone);
        }, this);

        this.initHeader();
    };

    this.end = function () {
        this.stones.forEach(function (stone) {
            stone.remove();
        });
    };

    this.initHeader = function () {
        var headerOptions = {
            id: "pentagon-header",
            pos: { x: 0.4, y: 0.6 },
            text: "Ondode in het pentagon!"
        };

        var header = this.createHeader(headerOptions);
        this.animateHeader(header);

        setTimeout(function () {
            header.parentNode.removeChild(header);
        }, 5000)
    };

    this.createHeader = function (options) {
        var header = document.createElement('h2');
        header.id = options.id;
        header.textContent = options.text;
        header.style.position = 'fixed';
        header.style.top = Math.round(window.innerHeight * options.pos.y) + 'px';
        header.style.left = Math.round(window.innerWidth * options.pos.x) + 'px';
        header.style.zIndex = '99999999';
        header.style.backgroundColor = 'white';
        document.body.appendChild(header);
        return header;
    };

    this.animateHeader = function (header) {
        var animate = function () {
            var tilt = Math.random() * 90 - 45;
            var scale = Math.random() * 0.4 + 0.8;
            header.style.transform = `rotate(${tilt}deg) scale(${scale})`;

            setTimeout(function () {
                header.style.transform = '';
                setTimeout(animate, 250);
            }, 250);
        };
        animate();
    };

    this.initialize();
}

export function StoneController(options) {
    return new StoneDispatch(options);
}