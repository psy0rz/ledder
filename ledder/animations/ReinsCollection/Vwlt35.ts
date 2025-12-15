import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"

const carSprites = {player: `.wwwwww.\nwwwwwwww\nwwwwwwww\nwwwwwwww\nyyyyyyyy\nrrrrrrrr\nrrrrrrrr\n.00..00.`,blue: `.#bbb#.\n#bbbbb#\nbbbbbbb\n.bbbbb.\nbb..bb.\nb....b.`,green: `.#ggg#.\n#ggggg#\nggggggg\n.ggggg.\ngg..gg.\ng....g.`,yellow: `.#yyy#.\n#yyyyy#\nyyyyyyy\n.yyyyy.\nyy..yy.\ny....y.`,white: `.#www#.\n#wwwww#\nwwwwwww\n.wwwww.\nww..ww.\nw....w.`}
interface RaceCar { position: number; lane: number; speed: number; color: string; sprite: string }

export default class Vwlt35 extends Animator {
    static category = "ReinsCollection"
    static title = "VW LT35 Van Race"
    static description = "VW LT35 van racing circuit - Pole Position style"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const spd = controls.value("Race Speed", 15, 1, 50, 1), numC = controls.value("Number of Cars", 5, 0, 8, 1), crv = controls.value("Track Curves", 50, 0, 100, 5)
        const scn = controls.select("Scene", "Mountains", [{id: "Mountains", name: "Mountains"}, {id: "City", name: "City"},{id: "Farmland", name: "Farmland"}, {id: "Forest", name: "Forest"}], true)
        const steer = controls.value("Player Steering", 0, -10, 10, 0.5), intv = controls.value("Animation interval", 1, 1, 10, 0.1)
        
        let pLane = 2, cars: RaceCar[] = [], track: number[] = [], hy = Math.floor(box.height() / 3), cc = ['blue', 'green', 'yellow', 'white']
        const bg = new PixelList(), hObj = new PixelList(), road = new PixelList(), crs = new PixelList(), hrz = new PixelList(), pCar = new PixelList(), trns = new PixelList(), sky = new PixelList()
        box.add(bg); box.add(hObj); box.add(road); box.add(sky); box.add(hrz); box.add(crs); box.add(pCar); box.add(trns)
        
        const sd = {Mountains: { sky: [135,206,235,55,40,20], ground: [0,150,0], sunPos: [0.75,0.3], sunColor: [255,250,200,1], cloudColor: [255,255,255,0.4] },City: { sky: [160,180,200,50,50,40], ground: [80,80,90], sunPos: [0.2,0.6], sunColor: [255,200,150,0.6], cloudColor: [180,180,190,0.32] },Farmland: { sky: [120,200,245,70,50,10], ground: [200,180,100], sunPos: [0.8,0.2], sunColor: [255,255,180,1], cloudColor: [250,250,255,0.4] },Forest: { sky: [140,190,220,40,50,30], ground: [0,100,0], sunPos: [0.7,0.4], sunColor: [255,240,180,0.7], cloudColor: [220,230,230,0.36] }}
        
        const mkBg = (s: string) => {
            bg.clear()
            const d = sd[s]
            for (let y = 0; y < box.height(); y++) {
                for (let x = 0; x < box.width(); x++) {
                    if (y < hy) {
                        const p = y / hy
                        bg.add(new Pixel(x, y, new Color(Math.floor(d.sky[0] + p * d.sky[3]),Math.floor(d.sky[1] + p * d.sky[4]),Math.floor(d.sky[2] + p * d.sky[5]), 1)))
                    } else bg.add(new Pixel(x, y, new Color(d.ground[0], d.ground[1], d.ground[2], 1)))
                }
            }
        }
        
        const mkHrz = (s: string) => {
            hObj.clear()
            const hb = hy - 1
            if (s === "Mountains") {
                for (let l = 0; l < 3; l++) {
                    const bc = 100 - l * 30, a = 0.3 + l/3 * 0.4, o = l * 5
                    for (let x = 0; x < box.width(); x++) {
                        const h = Math.floor(Math.sin(x/8+l*2)*8 + Math.sin(x/4+l)*4 + 10-l*3)
                        for (let i = 0; i < h; i++) {
                            const y = hb-i-o
                            if (y >= 0 && y < hy) hObj.add(new Pixel(x, y, new Color(bc,bc,bc+20,a)))
                        }
                    }
                }
            } else if (s === "City") {
                for (let x = 0; x < box.width(); x += 3) {
                    const h = Math.floor(Math.random()*15+5), w = Math.floor(Math.random()*4+2), b = 80 + Math.random()*40, a = 0.6 + Math.random()*0.3
                    for (let bx = 0; bx < w && x+bx < box.width(); bx++) {
                        for (let i = 0; i < h; i++) {
                            const y = hb-i
                            if (y >= 0 && y < hy) {
                                hObj.add(new Pixel(x+bx, y, new Color(b,b,b+10,a)))
                                if (Math.random()>0.7 && i>2) hObj.add(new Pixel(x+bx, y, new Color(255,255,200,a*0.8)))
                            }
                        }
                    }
                }
            } else if (s === "Forest") {
                for (let x = 0; x < box.width(); x++) {
                    const h = Math.floor(Math.sin(x/3)*4 + Math.sin(x/6)*2 + Math.random()*3 + 8)
                    for (let i = 0; i < h; i++) {
                        const y = hb-i
                        if (y >= 0 && y < hy) {
                            const d = 60-i*3, g = d+20
                            hObj.add(new Pixel(x, y, new Color(d*0.3,g,d*0.3,0.6)))
                        }
                    }
                }
            }
        }
        
        const mkTrk = (c: number) => { track = []; for (let i = 0; i < 120; i++) track.push(Math.sin(i/20) * c * 0.2 + Math.sin(i/10) * c * 0.1) }
        const initC = (n: number) => { cars = []; for (let i = 0; i < n; i++) cars.push({position: Math.random() * 1000,lane: Math.floor(Math.random() * 3),speed: 0.8 + Math.random() * 0.4,color: cc[i % cc.length],sprite: carSprites[cc[i % cc.length]]}); cars.sort((a, b) => a.position - b.position) }
        
        mkBg(scn.selected); mkHrz(scn.selected); mkTrk(crv.value); initC(numC.value)
        
        let lastN = numC.value, lastCrv = crv.value, lastScn = scn.selected, sOrd = ["Mountains", "City", "Farmland", "Forest"], cIdx = sOrd.indexOf(scn.selected), sFrm = 0, tPrg = 0, isTrn = false, nIdx = 0
        
        scheduler.intervalControlled(intv, (f) => {
            sFrm++
            if (sFrm >= 1800 && !isTrn) { isTrn = true; tPrg = 0; nIdx = (cIdx + 1) % sOrd.length }
            if (isTrn) { tPrg++; if (tPrg >= 60) { cIdx = nIdx; mkBg(sOrd[cIdx]); mkHrz(sOrd[cIdx]); isTrn = false; sFrm = 0 } }
            
            if (lastN !== numC.value) { initC(numC.value); lastN = numC.value }
            if (lastCrv !== crv.value) { mkTrk(crv.value); lastCrv = crv.value }
            if (lastScn !== scn.selected) { mkBg(scn.selected); mkHrz(scn.selected); cIdx = sOrd.indexOf(scn.selected); sFrm = 0; lastScn = scn.selected }
            
            let avoid = false, dir = 0
            for (let car of cars) {
                const cd = (car.position % 100) / 100
                if (cd > 0.7 && car.lane === pLane) {
                    avoid = true
                    if (pLane === 0) dir = 1
                    else if (pLane === 2) dir = -1
                    else dir = !cars.some(c => (c.position % 100) / 100 > 0.6 && c.lane === 2) ? 1 : -1
                    break
                }
            }
            if (avoid) {
                if (dir < 0 && pLane > 0) pLane = Math.max(0, pLane - 1)
                else if (dir > 0 && pLane < 2) pLane = Math.min(2, pLane + 1)
            }
            
            const si = steer.value
            if (si < -3 && pLane > 0) { pLane = Math.max(0, pLane - 1); steer.value = 0 }
            else if (si > 3 && pLane < 2) { pLane = Math.min(2, pLane + 1); steer.value = 0 }
            
            road.clear(); crs.clear(); hrz.clear(); pCar.clear(); trns.clear(); sky.clear()
            
            const cScn = isTrn ? sOrd[cIdx] : scn.selected, sdt = sd[cScn], sx = Math.floor(box.width() * sdt.sunPos[0]), sy = Math.floor(hy * sdt.sunPos[1])
            
            for (let dy = -4; dy <= 4; dy++) {
                for (let dx = -4; dx <= 4; dx++) {
                    const dst = Math.sqrt(dx*dx + dy*dy)
                    if (dst <= 4) {
                        const x = sx + dx, y = sy + dy
                        if (x >= 0 && x < box.width() && y >= 0 && y < hy) sky.add(new Pixel(x, y, new Color(sdt.sunColor[0],sdt.sunColor[1],sdt.sunColor[2],(1 - dst/4 * 0.7) * sdt.sunColor[3])))
                    }
                }
            }
            
            const cSpd = f * 0.1
            for (let ci = 0; ci < 4; ci++) {
                const cbx = ((ci * box.width()/3 + cSpd) % (box.width()+20)) - 10, cy = Math.floor(hy * 0.15) + ci * 5
                for (let pf = 0; pf < 3; pf++) {
                    const px = Math.floor(cbx + pf * 4), py = cy + (pf===1?-1:0)
                    for (let y = 0; y < 2; y++) {
                        for (let x = 0; x < 4; x++) {
                            const cx = px + x, ccy = py + y
                            if (cx >= 0 && cx < box.width() && ccy >= 0 && ccy < hy) sky.add(new Pixel(cx, ccy, new Color(sdt.cloudColor[0], sdt.cloudColor[1], sdt.cloudColor[2], sdt.cloudColor[3])))
                        }
                    }
                }
            }
            
            if (isTrn) {
                const fa = tPrg < 30 ? (tPrg/30)*0.6 : ((60-tPrg)/30)*0.6
                for (let y = 0; y < box.height(); y++) for (let x = 0; x < box.width(); x += 2) trns.add(new Pixel(x, y, new Color(0,0,0,fa)))
            }
            
            const cx = Math.floor(box.width() / 2), rh = box.height() - hy, rw = box.width() * 0.167
            
            for (let i = 0; i < rh; i++) {
                const ti = Math.floor((f * spd.value - i * 2) / 10) % track.length, off = track[ti], p = i / rh
                const crw = rw * (1 + p * 2), mo = box.width() / 2 - crw - 2, co = Math.max(-mo, Math.min(mo, off))
                const le = cx - crw + co, re = cx + crw + co, bg = 100 + p * 30
                
                for (let x = le; x < re; x++) road.add(new Pixel(Math.round(x), hy + i, new Color(bg, bg, bg, 1)))
                road.add(new Pixel(Math.round(le), hy + i, new Color(220,220,220,1)))
                road.add(new Pixel(Math.round(re), hy + i, new Color(220,220,220,1)))
                
                const ao = (f * spd.value / 10) - i
                if (ao % 8 < 4) road.add(new Pixel(Math.round(cx + co), hy + i, new Color(235 + p * 20, 235 + p * 20, 0, 0.7 + p * 0.3)))
                const ls = crw * 0.85
                if ((ao + 2) % 12 < 3) {
                    road.add(new Pixel(Math.round(cx - ls + co), hy + i, new Color(255,255,255,0.5+p*0.4)))
                    road.add(new Pixel(Math.round(cx + ls + co), hy + i, new Color(255,255,255,0.5+p*0.4)))
                }
            }
            
            for (let car of cars) {
                car.position += spd.value * car.speed * 0.5
                if (car.position >= 1000) car.position -= 1000
                const cd = (car.position % 100) / 100
                if (cd > 0.1) {
                    const cy = hy + Math.floor(cd * rh), ti = Math.floor((car.position * 10) / 10) % track.length, to = track[ti], lo = (car.lane - 1) * (box.width() / 6), cx = Math.floor(box.width() / 2) + to + lo - 3
                    if (cd > 0.4) crs.add(new DrawAsciiArtColor(Math.round(cx), cy, car.sprite))
                    else crs.add(new Pixel(Math.round(cx), cy, this.getColorForCar(car.color)))
                }
            }
            cars.sort((a, b) => a.position - b.position)
            
            const py = box.height() - 7, ti = Math.floor(f * spd.value / 10) % track.length, to = track[ti], lo = (pLane - 1) * (box.width() / 6), px = Math.floor(box.width() / 2) + to + lo - 3
            pCar.add(new DrawAsciiArtColor(Math.round(px), py, carSprites.player))
            
            for (let i = 0; i < rh; i += 5) {
                const ti = Math.floor((f * spd.value - i * 2) / 10) % track.length, off = track[ti], p = i / rh, crw = rw * (1 + p * 2), mo = box.width() / 2 - crw - 2, co = Math.max(-mo, Math.min(mo, off))
                const rel = cx - crw + co, rer = cx + crw + co
                if (Math.floor((f * spd.value - i * 2) / 50) % 4 === 0 && p > 0.2) {
                    const sy = hy + i
                    if (sy < box.height() - 2) {
                        const sa = p * 0.9 * (1 - (1 - p) * 0.6), lx = Math.floor(rel - 5 - p * 4), rx = Math.floor(rer + 3 + p * 4)
                        if (Math.random() > 0.5) hrz.add(new Pixel(lx, sy, new Color(100,150,100,sa*0.8)))
                        if (Math.random() > 0.5) hrz.add(new Pixel(rx, sy, new Color(100,150,100,sa*0.8)))
                    }
                }
            }
            
            this.aa(road, box.width(), box.height())
            this.aa(sky, box.width(), box.height())
            this.aa(hrz, box.width(), box.height())
            this.aa(crs, box.width(), box.height())
        })
    }
    
    private getColorForCar(c: string): Color {
        const cols = { player: [255,0,0], blue: [0,0,255], green: [0,255,0], yellow: [255,255,0], white: [255,255,255] }
        const cl = cols[c] || [128,128,128]
        return new Color(cl[0], cl[1], cl[2], 1)
    }
    
    private aa(list: PixelList, w: number, h: number) {
        const pm = new Map<string, Pixel>(), pp: Pixel[] = []
        list.forEachPixel((p) => { pm.set(`${p.x},${p.y}`, p); pp.push(p) })
        const np: Pixel[] = [], edg = [{dx:1,dy:0,w:0.7},{dx:-1,dy:0,w:0.7},{dx:0,dy:1,w:0.7},{dx:0,dy:-1,w:0.7},{dx:1,dy:1,w:0.5},{dx:-1,dy:1,w:0.5},{dx:1,dy:-1,w:0.5},{dx:-1,dy:-1,w:0.5}]
        for (const p of pp) {
            for (const {dx, dy, w} of edg) {
                const nx = p.x + dx, ny = p.y + dy, k = `${nx},${ny}`
                if (!pm.has(k) && nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    const n = new Pixel(nx, ny, new Color(p.color.r, p.color.g, p.color.b, p.color.a * w * 0.6))
                    np.push(n)
                    pm.set(k, n)
                }
            }
        }
        for (const p of np) list.add(p)
    }
}
