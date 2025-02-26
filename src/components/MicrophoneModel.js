import React from 'react';
import { useFrame } from '@react-three/fiber';

const MicrophoneModel = ({ rotation }) => {
  const ref = React.useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += rotation;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};

export default MicrophoneModel; 