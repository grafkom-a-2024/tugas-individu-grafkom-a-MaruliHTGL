function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function createCube(gl) {
  const positions = new Float32Array([
    // Front face
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    // Back face
    -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
    // Top face
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
    // Bottom face
    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
    // Right face
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
    // Left face
    -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
  ]);

  const colors = new Float32Array([
    // Front face
    1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
    // Back face
    0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    // Top face
    0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1,
    // Bottom face
    1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1,
    // Right face
    1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
    // Left face
    0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1,
  ]);

  const indices = new Uint16Array([
    0,
    1,
    2,
    0,
    2,
    3, // Front face
    4,
    5,
    6,
    4,
    6,
    7, // Back face
    8,
    9,
    10,
    8,
    10,
    11, // Top face
    12,
    13,
    14,
    12,
    14,
    15, // Bottom face
    16,
    17,
    18,
    16,
    18,
    19, // Right face
    20,
    21,
    22,
    20,
    22,
    23, // Left face
  ]);

  return { positions, colors, indices };
}

function createCylinder(gl, radiusTop, radiusBottom, height, radialSegments) {
  const positions = [];
  const colors = [];
  const indices = [];

  // Vertices untuk penutup atas dan bawah
  for (let i = 0; i <= radialSegments; i++) {
    const theta = (i / radialSegments) * 2 * Math.PI;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    // Vertex untuk sisi
    positions.push(radiusTop * cosTheta, height / 2, radiusTop * sinTheta);
    positions.push(radiusBottom * cosTheta, -height / 2, radiusBottom * sinTheta);

    const color = [0.0, 1.0, 0.0, 1.0];
    colors.push(...color, ...color);

    if (i > 0) {
      const indexOffset = i * 2;
      // Indeks untuk sisi
      indices.push(indexOffset - 2, indexOffset - 1, indexOffset);
      indices.push(indexOffset - 1, indexOffset, indexOffset + 1);
    }
  }

  // Vertices untuk penutup atas dan bawah
  positions.push(0, height / 2, 0);
  positions.push(0, -height / 2, 0);
  colors.push(1, 1, 1, 1);
  colors.push(1, 1, 1, 1);

  for (let i = 0; i < radialSegments; i++) {
    const index1 = i * 2;
    const index2 = ((i + 1) % radialSegments) * 2;
    indices.push(index1, index2, positions.length / 3 - 2); // Penutup atas
    indices.push(index1 + 1, index2 + 1, positions.length / 3 - 1); // Penutup bawah
  }

  return { positions: new Float32Array(positions), colors: new Float32Array(colors), indices: new Uint16Array(indices) };
}

function createCone(gl, radius, height, radialSegments) {
  const positions = [];
  const colors = [];
  const indices = [];

  // Puncak kerucut
  positions.push(0, height / 2, 0);
  colors.push(1.0, 0.0, 0.0, 1.0);

  // Basis lingkaran
  for (let i = 0; i <= radialSegments; i++) {
    const theta = (i / radialSegments) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);

    positions.push(x, -height / 2, z);
    colors.push(1.0, 0.0, 0.0, 1.0);
  }

  // Indeks untuk sisi-sisi kerucut
  for (let i = 1; i <= radialSegments; i++) {
    indices.push(0, i, i + 1);
  }

  // Pusat basis
  positions.push(0, -height / 2, 0);
  colors.push(1, 1, 1, 1.0);

  // Indeks untuk basis (menghubungkan titik pusat dengan lingkaran basis)
  const centerIndex = positions.length / 3 - 1;
  for (let i = 1; i < radialSegments; i++) {
    indices.push(centerIndex, i + 1, i);
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices),
  };
}

function main() {
  const canvas = document.getElementById("webglCanvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.error("WebGL not supported");
    return;
  }

  const vertexShaderSource = `
      attribute vec4 aPosition;
      attribute vec4 aColor;
      uniform mat4 uMatrix;
      varying vec4 vColor;
      void main() {
        gl_Position = uMatrix * aPosition;
        vColor = aColor;
      }
    `;

  const fragmentShaderSource = `
      precision mediump float;
      varying vec4 vColor;
      void main() {
        gl_FragColor = vColor;
      }
    `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const colorLocation = gl.getAttribLocation(program, "aColor");
  const uMatrixLocation = gl.getUniformLocation(program, "uMatrix");

  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  gl.useProgram(program);
  gl.enableVertexAttribArray(positionLocation);
  gl.enableVertexAttribArray(colorLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

  const cube = createCube(gl);
  const cylinder = createCylinder(gl, 0.5, 0.5, 1.5, 32);
  const cone = createCone(gl, 0.5, 1.5, 32);

  function drawScene(time) {
    time *= 0.001;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const projectionMatrix = mat4.perspective(mat4.create(), Math.PI / 4, aspect, 0.1, 100);

    // Draw Cube
    let modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-3, 0, -7]);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, time);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, time);

    let finalMatrix = mat4.multiply(mat4.create(), projectionMatrix, modelViewMatrix);
    gl.uniformMatrix4fv(uMatrixLocation, false, finalMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);

    // Draw Cylinder
    modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -7]);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, time);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, time);

    finalMatrix = mat4.multiply(mat4.create(), projectionMatrix, modelViewMatrix);
    gl.uniformMatrix4fv(uMatrixLocation, false, finalMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cylinder.positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cylinder.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cylinder.indices, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, cylinder.indices.length, gl.UNSIGNED_SHORT, 0);

    // Draw Cone
    modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [3, 0, -7]);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, time);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, time);

    finalMatrix = mat4.multiply(mat4.create(), projectionMatrix, modelViewMatrix);
    gl.uniformMatrix4fv(uMatrixLocation, false, finalMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cone.positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cone.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cone.indices, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, cone.indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(drawScene);
  }

  requestAnimationFrame(drawScene);
}

window.onload = main;
