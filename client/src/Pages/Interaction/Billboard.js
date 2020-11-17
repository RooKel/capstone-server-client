
const Billboard = (object, target, sigs)=>{
    sigs.update.add(()=>{
        object.lookAt(target.position);
    })
}

export default Billboard