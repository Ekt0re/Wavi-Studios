import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import MicrophoneModel from './MicrophoneModel';
import HeadphonesModel from './HeadphonesModel';
import '../styles/Scene3D.scss';

const Scene3D = ({ rotation, modelType }) => {
  return (
    <div className="scene3d-container" style={{ 
      position: 'absolute', 
      left: '50%', 
      top: '50%', 
      transform: 'translate(-50%, -50%)',
      width: '100%', 
      height: '100vh',
      zIndex: -1 
    }}>
      <Canvas shadows>
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 5]} 
          fov={75}
        />
        <ambientLight intensity={1.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
        />
        <Suspense fallback={
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#ff4d4d" wireframe />
          </mesh>
        }>
          {modelType === 'headphones' ? (
            <HeadphonesModel rotation={rotation} />
          ) : modelType === 'microphone' ? (
            <MicrophoneModel rotation={rotation} />
          ) : null}
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Scene3D; 