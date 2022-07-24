export const UserNameGenerator = ()=>{
    let numbers = Math.floor(Math.random()*90000) + 10000
    let characters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
    let letters = ''
    for(let i=0 ; i<8 ; i++){
        letters += characters[Math.floor(Math.random() * (25  + 1))]
    }
    return `${letters}_${numbers}`
}