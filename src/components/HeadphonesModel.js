import React from 'react';
import { useFrame } from '@react-three/fiber';

const HeadphonesModel = ({ rotation }) => {
  const ref = React.useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={ref} position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}>
      {/* Base delle cuffie */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1, 0.1, 32, 100]} />
        <meshStandardMaterial 
          color="#333333"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Padiglioni sinistro e destro */}
      <mesh position={[-1, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#222222"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[1, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#222222"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Archetto superiore */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <torusGeometry args={[1, 0.05, 32, 100, Math.PI]} />
        <meshStandardMaterial 
          color="#444444"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

export default HeadphonesModel; 