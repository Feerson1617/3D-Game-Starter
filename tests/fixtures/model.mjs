// Original technical triangle fixture, not a third-party or game asset.
export function modelFixture() {
  const data=new Float32Array([
    -1,0,0, 1,0,0, 0,2,0, // positions
    0,0,1, 0,0,1, 0,0,1, // normals
    0,0, 1,0, .5,1, // UVs
    0,1, // animation times
    0,0,0, 0,1,0, // translations
  ]);
  const buffer=Buffer.from(data.buffer);
  const document={
    asset:{version:'2.0',generator:'3D Starter integration fixture'}, scene:0,
    scenes:[{nodes:[0]}],nodes:[{name:'AnimatedTriangle',mesh:0}],
    buffers:[{uri:'model.bin',byteLength:buffer.length}],
    bufferViews:[
      {buffer:0,byteOffset:0,byteLength:36,target:34962},
      {buffer:0,byteOffset:36,byteLength:36,target:34962},
      {buffer:0,byteOffset:72,byteLength:24,target:34962},
      {buffer:0,byteOffset:96,byteLength:8},
      {buffer:0,byteOffset:104,byteLength:24},
    ],
    accessors:[
      {bufferView:0,componentType:5126,count:3,type:'VEC3',min:[-1,0,0],max:[1,2,0]},
      {bufferView:1,componentType:5126,count:3,type:'VEC3'},
      {bufferView:2,componentType:5126,count:3,type:'VEC2'},
      {bufferView:3,componentType:5126,count:2,type:'SCALAR',min:[0],max:[1]},
      {bufferView:4,componentType:5126,count:2,type:'VEC3'},
    ],
    meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1,TEXCOORD_0:2},material:0}]}],
    materials:[{pbrMetallicRoughness:{baseColorTexture:{index:0},metallicFactor:.25,roughnessFactor:.6},doubleSided:true}],
    textures:[{source:0}],images:[{uri:'color.png'}],
    animations:[{name:'Rise',samplers:[{input:3,output:4,interpolation:'LINEAR'}],channels:[{sampler:0,target:{node:0,path:'translation'}}]}],
  };
  const binaryDoc=structuredClone(document);
  delete binaryDoc.buffers[0].uri;
  const json=Buffer.from(JSON.stringify(binaryDoc));
  const paddedJson=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);
  const glb=Buffer.alloc(12+8+paddedJson.length+8+buffer.length);
  glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);
  glb.writeUInt32LE(paddedJson.length,12);glb.writeUInt32LE(0x4e4f534a,16);paddedJson.copy(glb,20);
  const offset=20+paddedJson.length;
  glb.writeUInt32LE(buffer.length,offset);glb.writeUInt32LE(0x004e4942,offset+4);buffer.copy(glb,offset+8);
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGPYUhHwHwAF3AJ87KagKwAAAABJRU5ErkJggg==','base64');
  return {document,buffer,glb,png};
}
