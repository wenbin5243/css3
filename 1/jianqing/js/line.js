/**
 * Description: 设计图连线功能模块
 * Author: SteveZheng
 * Date: 13-2-4
 * Time: 下午7:48
 * History: 13-2-4 新增画板
 *                 新增连线功能
 *                 新增拉拽
 *          13-2-5 todo:
 *                 重构代码
 *                 Add:
 *                 选择高亮
 *                 画板缩放//有bug，整个画布没有按比例放大缩小，而且每个画板之间的距离没有改变
 *                 画板移动
 *                 连线删除//todo:暂时没找到方法让mouseover的范围扩大
 *                 连线样式//todo:暂时没找到方法添加箭头
 *          13-2-18 整理代码
 */
(function () {
    Raphael.fn.connection = function (obj1, obj2, line, bg) {
        if (obj1.line && obj1.from && obj1.to) {
            line = obj1;
            obj1 = line.from;
            obj2 = line.to;
        }
        var bb1 = obj1.getBBox(),
            bb2 = obj2.getBBox(),
            p = [
                {x:bb1.x + bb1.width / 2, y:bb1.y - 1},
                {x:bb1.x + bb1.width / 2, y:bb1.y + bb1.height + 1},
                {x:bb1.x - 1, y:bb1.y + bb1.height / 2},
                {x:bb1.x + bb1.width + 1, y:bb1.y + bb1.height / 2},
                {x:bb2.x + bb2.width / 2, y:bb2.y - 1},
                {x:bb2.x + bb2.width / 2, y:bb2.y + bb2.height + 1},
                {x:bb2.x - 1, y:bb2.y + bb2.height / 2},
                {x:bb2.x + bb2.width + 1, y:bb2.y + bb2.height / 2}
            ],
            d = {}, dis = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 4; j < 8; j++) {
                var dx = Math.abs(p[i].x - p[j].x),
                    dy = Math.abs(p[i].y - p[j].y);
                if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                    dis.push(dx + dy);
                    d[dis[dis.length - 1]] = [i, j];
                }
            }
        }
        if (dis.length == 0) {
            var res = [0, 4];
        } else {
            res = d[Math.min.apply(Math, dis)];
        }
        var x1 = p[res[0]].x,
            y1 = p[res[0]].y,
            x4 = p[res[1]].x,
            y4 = p[res[1]].y;
        dx = Math.max(Math.abs(x1 - x4) / 2, 10);
        dy = Math.max(Math.abs(y1 - y4) / 2, 10);
        var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
            y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
            x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
            y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
        var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
        if (line && line.line) {
            line.bg && line.bg.attr({path:path});
            line.line.attr({path:path});
        } else {
            var color = typeof line == "string" ? line : "#666";
            return {
                bg:bg && bg.split && this.path(path).attr({stroke:bg.split("|")[0], fill:"none", "stroke-width":bg.split("|")[1] || 3}),
                line:this.path(path).attr({stroke:"#666", fill:"none", "stroke-width":4}),
                from:obj1,
                to:obj2
            };
        }
    };

    var el;
    var r = Raphael("b", 2000, 1000);//画布大小
    var glow;
    var isFromFlag = 'from';
    var isActiveFlag = 'deactive';//添加连线功能是否激活
    var from, to;

    var dragger = function () {
            this.ox = this.type == "image" ? this.attr("x") : this.attr("cx");
            this.oy = this.type == "image" ? this.attr("y") : this.attr("cy");
            this.animate({"fill-opacity":.2}, 500);
        },
        move = function (dx, dy) {
            var att = this.type == "image" ? {x:this.ox + dx, y:this.oy + dy} : {cx:this.ox + dx, cy:this.oy + dy};
            this.attr(att);
            for (var i = connections.length; i--;) {
                r.connection(connections[i]);
            }
            r.safari();
        },
        up = function () {
            this.animate({"fill-opacity":0}, 500);
        },
        connections = [],
        shapes = [  r.image('http://placebox.es/120/200', 10, 100, 120, 200),
            r.image('http://placebox.es/120/200', 250, 100, 120, 200),
            r.image('http://placebox.es/120/200', 450, 100, 120, 200),
            r.image('http://placebox.es/120/200', 650, 100, 120, 200),
            r.image('http://placebox.es/120/200', 850, 100, 120, 200)
        ];

    function activeDrag() {
        for (var i = 0, ii = shapes.length; i < ii; i++) {
            shapes[i].attr({cursor:"pointer"});
            shapes[i].drag(move, dragger, up);
        }
    }

    activeDrag();

    function deactiveDrag() {
        for (var i = 0, ii = shapes.length; i < ii; i++) {
            shapes[i].attr({cursor:"pointer"});
            shapes[i].undrag();
        }
    }

    function removeLine() {
        for (var i = 0, len = connections.length; i < len; i++) {
            connections[i].line.mouseover(function () {
                this.attr({'stroke-dasharray':'-'});
            });

            connections[i].line.click(function () {
                this.remove();
            });

            connections[i].line.mouseout(function () {
                this.attr({'stroke-dasharray':''});
            });
        }
    }

    //添加连线
    var addLine = function (from, to) {
        connections.push(r.connection(from, to, '#000'));
    }

    //选择连线对象
    var selectObj = function (obj) {
        if (isFromFlag == 'from' && isActiveFlag == 'active') {
            from = obj;
            isFromFlag = 'to';
            glow = obj.glow({color:'#FF7F00'});
        } else {
            if (from != obj && isActiveFlag == 'active') {
                to = obj;
                isFromFlag = 'from';
                addLine(from, to);
                glow.remove();
                removeLine();
            }
        }
    }

    //连线功能绑定
    var toggleAddLine = (function () {
        for (var i = 0, len = shapes.length; i < len; i++) {
            shapes[i].attr({cursor:"default"});
            shapes[i].click(function () {
                selectObj(this);
            });
        }
    })();

    //激活连线功能
    $('.i15,.i16').toggle(function () {
        $(this).addClass('active');
        deactiveDrag();//关闭拖拽功能
        isActiveFlag = 'active';
        isFromFlag = 'from';
        return false;
    }, function () {
        $(this).removeClass('active');
        if (glow) {
            glow.remove();
        }
        activeDrag();//开启拖拽功能
        isActiveFlag = 'deactive';
        return false;
    });

    //比例尺放大缩小
    //todo：
    //bug:这种放大只是元素放大了，但是没有放大其size
    var scaleStatus = 1;
    $('#h .r3 .c2 .d5 li').click(function () {
        var li_text = $(this).text();
        switch (li_text) {
            case '200%':
                for (var i = 0, len = shapes.length; i < len; i++) {
                    shapes[i].scale(2 / scaleStatus, 2 / scaleStatus);
                }
                scaleStatus = 2;
                break;
            case '150%':
                for (var i = 0, len = shapes.length; i < len; i++) {
                    shapes[i].scale(1.5 / scaleStatus, 1.5 / scaleStatus);
                }
                scaleStatus = 1.5;
                break;
            case '100%':
                for (var i = 0, len = shapes.length; i < len; i++) {
                    shapes[i].scale(1 / scaleStatus, 1 / scaleStatus);
                }
                scaleStatus = 1;
                break;
            case '50%':
                for (var i = 0, len = shapes.length; i < len; i++) {
                    shapes[i].scale(0.5 / scaleStatus, 0.5 / scaleStatus);
                }
                scaleStatus = 0.5;
                break;
        }
        $('#h .r3 .c2 .d5 .s2').text(li_text);
        $('#h .r3 .c2 .d5 .s1').hide();
    });

    //移动设计板
    $('.i16').click(function () {
        if ($(this).hasClass('active')) {
            $('.mask').show();
            $('#b').draggable();
            return function () {
                $('.mask').show();
                $('#b').draggable('enable');
            }
        } else {
            $('.mask').hide();
            $('#b').draggable('disable');
        }
    });
})();