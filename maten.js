let stripHeight=10
let ledDist=16.6666
let rows=8
let cols=75

console.log("Bord lengte", ledDist*cols)
console.log("Bord hoogte", ledDist*rows)
for (let i=0 ; i<rows ; i++)
{
    //lijn bovenkant strip
    let bovenkant=(ledDist/2)-(stripHeight/2)+(i*ledDist)
    console.log(bovenkant)
}