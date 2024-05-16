const flip = fn => (b, a) => fn(a, b);

// enlightened by a conversation had with elseif on the first days of OHS, i think that a lot of these can be oneliners.
// if i ever touch this file again (i probably wont) then maybe do so?
// but on the other hand there's readability concerns. I want the code to be maintainable and easily readable, even if
// i'm the only one working on the game.

// we want to be able to call Collisions.collide(poly)(circle)
class Collision {
    constructor(){
        this.collisionMap = {};
        // idea: since this is in a hashmap anyways why dont just make a function that checks the type of 2 sats and then checks colliswion accordingly
        // if there's special cases maybe we can have a prelim check function or something for collision cases that don't count
        // another idea/ necessity: in order for the game to be sucessful at all we need decoration blocks right on release

        // these need to be specified in the same order
        this.addCollisionMap('circle', 'circle', (circle1, circle2) => {
            if((circle1.x-circle2.x)**2+(circle1.y-circle2.y)**2 < (circle1.body.r+circle2.body.r)**2){
                const res = new SAT.Response();
                SAT.testCircleCircle(circle2.body, circle1.body, res);
                return res;
            }
            return false;
        });

        this.addCollisionMap('circle', 'poly', (circle, poly) => {
            if(!intersectingBoundingBox(circle, poly)){
                return false;
            }
            
            const res = new SAT.Response();
            if (SAT.testPolygonCircle(poly.body, circle.body, res)) {
                if(poly.isPlayer === true){
                    res.overlapV.x *= -1;
                    res.overlapV.y *= -1;
                    res.overlapN.x *= -1;
                    res.overlapN.y *= -1;
                }
                return res;
            }
            return false;
        });

        this.addCollisionMap('poly', 'poly', (poly1, poly2) => {
            if(!intersectingBoundingBox(poly1, poly2)){
                return false;
            }
            const res = new SAT.Response();
            if (SAT.testPolygonPolygon(poly2.body, poly1.body, res)) {
                return res;
            }
            return false;
        });

        for(let key in this.collisionMap){
            this.addCollisionMap('text', key, (text, otherObj) => {
                if(text.shapeCollidable === false){
                    return false;
                }
                return this.collisionMap['poly'][otherObj.shape](text, otherObj);
            });
        }
    }
	// outsource this later
    addCollisionMap(type1, type2, fn) {
        if(this.collisionMap[type1] === undefined){
            this.collisionMap[type1] = {};
        }
        if(this.collisionMap[type2] === undefined){
            this.collisionMap[type2] = {};
        }
        this.collisionMap[type1][type2] = fn;
        if(type1 !== type2){
            this.collisionMap[type2][type1] = flip(fn);
        }
    }
}

function intersectingBoundingBox(obj1, obj2){
    if(obj1.x - obj1.difference.x/2 > obj2.x + obj2.difference.x/2 || obj1.x + obj1.difference.x/2 < obj2.x - obj2.difference.x/2) return false;
    if(obj1.y - obj1.difference.y/2 > obj2.y + obj2.difference.y/2 || obj1.y + obj1.difference.y/2 < obj2.y - obj2.difference.y/2) return false;
    return true;
}

const collisions = new Collision();
function Collide(body1, body2){
    return collisions.collisionMap[body1.shape][body2.shape](body1, body2);
}

export default Collide;