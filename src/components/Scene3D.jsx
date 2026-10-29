import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const PI = Math.PI;
const BASE = '#cfe3e0'; // neutral mannequin tone (not a skin-colour claim)
const HAIR = '#2c4a57';
const HOVER = '#75dad7';
const SELECTED = '#e4bb69';

const Mat = ({ color }) => (
  <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} side={THREE.DoubleSide} />
);

// Wraps meshes that belong to one clickable region; children receives the current colour.
function Region({ id, base = BASE, hovered, selected, onHover, onSelect, children }) {
  const active = selected === id || hovered === id;
  const color = selected === id ? SELECTED : hovered === id ? HOVER : base;
  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      {children(color, active)}
    </group>
  );
}

/* ------------------------------ FULL BODY ------------------------------ */
function Body(props) {
  const sides = [-1, 1];
  return (
    <group>
      <Region id="face" {...props}>
        {(c) => (
          <group>
            <mesh position={[0, 5.95, 0]} scale={[1, 1.15, 1]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <Mat color={c} />
            </mesh>
            <mesh position={[0, 5.88, 0.5]} rotation={[PI / 2, 0, 0]}>
              <coneGeometry args={[0.06, 0.16, 12]} />
              <Mat color={c} />
            </mesh>
          </group>
        )}
      </Region>

      <Region id="neck" {...props}>
        {(c) => (
          <mesh position={[0, 5.42, 0]}>
            <cylinderGeometry args={[0.17, 0.19, 0.4, 20]} />
            <Mat color={c} />
          </mesh>
        )}
      </Region>

      <Region id="chest" {...props}>
        {(c) => (
          <RoundedBox args={[1.5, 1.2, 0.5]} radius={0.2} smoothness={4} position={[0, 4.7, 0.14]}>
            <Mat color={c} />
          </RoundedBox>
        )}
      </Region>
      <Region id="upper-back" {...props}>
        {(c) => (
          <RoundedBox args={[1.5, 1.2, 0.5]} radius={0.2} smoothness={4} position={[0, 4.7, -0.14]}>
            <Mat color={c} />
          </RoundedBox>
        )}
      </Region>
      <Region id="abdomen" {...props}>
        {(c) => (
          <RoundedBox args={[1.35, 1.15, 0.5]} radius={0.2} smoothness={4} position={[0, 3.55, 0.12]}>
            <Mat color={c} />
          </RoundedBox>
        )}
      </Region>
      <Region id="lower-back" {...props}>
        {(c) => (
          <RoundedBox args={[1.35, 1.15, 0.5]} radius={0.2} smoothness={4} position={[0, 3.55, -0.12]}>
            <Mat color={c} />
          </RoundedBox>
        )}
      </Region>

      <Region id="arms" {...props}>
        {(c) => (
          <group>
            {sides.map((s) => (
              <group key={s}>
                <mesh position={[s * 0.88, 5.08, 0]}>
                  <sphereGeometry args={[0.27, 24, 24]} />
                  <Mat color={c} />
                </mesh>
                <mesh position={[s * 1.02, 4.4, 0]}>
                  <capsuleGeometry args={[0.2, 0.9, 8, 16]} />
                  <Mat color={c} />
                </mesh>
                <mesh position={[s * 1.06, 3.25, 0]}>
                  <capsuleGeometry args={[0.17, 0.85, 8, 16]} />
                  <Mat color={c} />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </Region>

      <Region id="hands" {...props}>
        {(c) => (
          <group>
            {sides.map((s) => (
              <mesh key={s} position={[s * 1.08, 2.5, 0]} scale={[1, 1.4, 0.7]}>
                <sphereGeometry args={[0.18, 20, 20]} />
                <Mat color={c} />
              </mesh>
            ))}
          </group>
        )}
      </Region>

      <Region id="thighs" {...props}>
        {(c) => (
          <group>
            {sides.map((s) => (
              <mesh key={s} position={[s * 0.36, 2.55, 0]}>
                <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
                <Mat color={c} />
              </mesh>
            ))}
          </group>
        )}
      </Region>

      <Region id="lower-legs" {...props}>
        {(c) => (
          <group>
            {sides.map((s) => (
              <mesh key={s} position={[s * 0.36, 1.0, 0]}>
                <capsuleGeometry args={[0.24, 1.2, 8, 16]} />
                <Mat color={c} />
              </mesh>
            ))}
          </group>
        )}
      </Region>

      <Region id="feet" {...props}>
        {(c) => (
          <group>
            {sides.map((s) => (
              <RoundedBox
                key={s}
                args={[0.42, 0.22, 0.85]}
                radius={0.1}
                smoothness={4}
                position={[s * 0.36, 0.1, 0.18]}
              >
                <Mat color={c} />
              </RoundedBox>
            ))}
          </group>
        )}
      </Region>

      {/* Floor disc */}
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[1.9, 48]} />
        <meshStandardMaterial color="#0d2531" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ------------------------------ HEAD & HAIR ------------------------------ */
// Scalp zones are sectors of a sphere. Front of the head faces +Z.
const SECTOR = PI / 2;
const ZONES = [
  { id: 'hairline', parts: [{ phiStart: PI / 4, phiLength: SECTOR, thetaStart: 0.95, thetaLength: 0.45 }] },
  { id: 'mid-scalp', parts: [{ phiStart: PI / 4, phiLength: SECTOR, thetaStart: 0.5, thetaLength: 0.45 }] },
  { id: 'crown', parts: [{ phiStart: 0, phiLength: PI * 2, thetaStart: 0, thetaLength: 0.5 }] },
  {
    id: 'sides',
    parts: [
      { phiStart: -PI / 4, phiLength: SECTOR, thetaStart: 0.5, thetaLength: 1.4 },
      { phiStart: (3 * PI) / 4, phiLength: SECTOR, thetaStart: 0.5, thetaLength: 1.4 },
    ],
  },
  { id: 'back', parts: [{ phiStart: (5 * PI) / 4, phiLength: SECTOR, thetaStart: 0.5, thetaLength: 1.4 }] },
];

// Thin dark strands scattered over the scalp so it reads as "hair".
function Strands() {
  const positions = useMemo(() => {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const out = [];
    for (let i = 0; i < 1400; i += 1) {
      const theta = Math.acos(1 - rnd() * (1 - Math.cos(1.9)));
      const phi = rnd() * PI * 2;
      if (phi > PI / 4 && phi < (3 * PI) / 4 && theta > 1.4) continue; // keep the face clear
      const x = -Math.cos(phi) * Math.sin(theta);
      const y = Math.cos(theta);
      const z = Math.sin(phi) * Math.sin(theta);
      const j = () => (rnd() - 0.5) * 0.05;
      out.push(x, y, z, x * 1.09 + j(), y * 1.09 + j(), z * 1.09 + j());
    }
    return new Float32Array(out);
  }, []);

  return (
    <lineSegments raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#14262e" transparent opacity={0.85} />
    </lineSegments>
  );
}

function Head(props) {
  return (
    <group>
      <group scale={[1, 1.15, 1]}>
        {/* bare skin: face, ears, neck */}
        <mesh>
          <sphereGeometry args={[0.97, 48, 48]} />
          <Mat color={BASE} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.0, -0.1, 0]} scale={[0.4, 1, 0.7]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <Mat color={BASE} />
          </mesh>
        ))}
        <mesh position={[0, -0.28, 0.99]} rotation={[PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.28, 12]} />
          <Mat color={BASE} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={`e${s}`} position={[s * 0.32, -0.04, 0.9]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#14262e" />
          </mesh>
        ))}

        {/* clickable scalp zones */}
        {ZONES.map((zone) => (
          <Region key={zone.id} id={zone.id} base={HAIR} {...props}>
            {(c) => (
              <group>
                {zone.parts.map((p, i) => (
                  <mesh key={i}>
                    <sphereGeometry
                      args={[1.0, 48, 32, p.phiStart, p.phiLength, p.thetaStart, p.thetaLength]}
                    />
                    <Mat color={c} />
                  </mesh>
                ))}
              </group>
            )}
          </Region>
        ))}
        <Strands />
      </group>

      <mesh position={[0, -1.45, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 1.0, 24]} />
        <Mat color={BASE} />
      </mesh>
    </group>
  );
}

/* ------------------------------ FACE (3D) ------------------------------ */
const FACE_TILE = '#b5d9d7'; // clickable areas are tinted slightly so people can see where to click
const MID = PI / 2; // the face looks toward +Z, which is phi = PI / 2

// A patch of the head sphere: d0..d1 = angle left/right of the centre line, t0..t1 = angle down from the top.
const patch = (d0, d1, t0, t1) => ({
  phiStart: MID + d0,
  phiLength: d1 - d0,
  thetaStart: t0,
  thetaLength: t1 - t0,
});

// Patches tile the front of the face without overlapping.
const W = 1.2; // how far the face patches wrap around the sides of the head
const HAIR_END = 0.8; // hair covers the top of the head down to this angle
const FACE_ZONES = [
  { id: 'forehead', parts: [patch(-W, W, HAIR_END, 1.15)] },
  { id: 'eyes', parts: [patch(-W, -0.14, 1.15, 1.5), patch(0.14, W, 1.15, 1.5)] },
  { id: 'nose', parts: [patch(-0.14, 0.14, 1.15, 2.05)] },
  { id: 'cheeks', parts: [patch(-W, -0.14, 1.5, 2.05), patch(0.14, W, 1.5, 2.05)] },
  { id: 'mouth', parts: [patch(-0.45, 0.45, 2.05, 2.3)] },
  {
    id: 'chin',
    parts: [patch(-0.45, 0.45, 2.3, 2.75), patch(-W, -0.45, 2.05, 2.75), patch(0.45, W, 2.05, 2.75)],
  },
];

const noRay = () => null; // decorative meshes never block hovering or clicking

function FaceHead(props) {
  return (
    <group>
      <group scale={[1, 1.15, 1]}>
        <mesh>
          <sphereGeometry args={[0.97, 48, 48]} />
          <Mat color={BASE} />
        </mesh>

        {/* clickable face areas */}
        {FACE_ZONES.map((zone) => (
          <Region key={zone.id} id={zone.id} base={FACE_TILE} {...props}>
            {(c, active) => (
              <group>
                {zone.parts.map((p, i) => (
                  <mesh key={i}>
                    <sphereGeometry
                      args={[1.0, 40, 24, p.phiStart, p.phiLength, p.thetaStart, p.thetaLength]}
                    />
                    <Mat color={c} />
                  </mesh>
                ))}
                {zone.id === 'nose' && (
                  <mesh position={[0, -0.1, 0.94]} scale={[1.1, 1.7, 1.6]}>
                    <sphereGeometry args={[0.12, 24, 24]} />
                    <Mat color={c} />
                  </mesh>
                )}
                {zone.id === 'mouth' && (
                  <mesh position={[0, -0.56, 0.84]} scale={[1.7, 0.5, 0.55]}>
                    <sphereGeometry args={[0.13, 24, 16]} />
                    <Mat color={active ? c : '#df9aa0'} />
                  </mesh>
                )}
              </group>
            )}
          </Region>
        ))}

        <Region id="ears" base={FACE_TILE} {...props}>
          {(c) => (
            <group>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 1.0, -0.1, 0]} scale={[0.4, 1, 0.7]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <Mat color={c} />
                </mesh>
              ))}
            </group>
          )}
        </Region>

        {/* eyes and eyebrows (decoration) */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.34, 0.24, 0.92]} raycast={noRay}>
              <sphereGeometry args={[0.085, 20, 20]} />
              <meshStandardMaterial color="#f4f7f6" roughness={0.3} />
            </mesh>
            <mesh position={[s * 0.34, 0.24, 0.99]} raycast={noRay}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#14262e" roughness={0.3} />
            </mesh>
            <mesh position={[s * 0.34, 0.42, 0.86]} rotation={[0, s * 0.38, 0]} raycast={noRay}>
              <boxGeometry args={[0.32, 0.035, 0.05]} />
              <meshStandardMaterial color="#14262e" />
            </mesh>
          </group>
        ))}

        {/* hair (decoration) */}
        <mesh raycast={noRay}>
          <sphereGeometry args={[1.03, 48, 24, 0, PI * 2, 0, HAIR_END]} />
          <Mat color={HAIR} />
        </mesh>
        <mesh raycast={noRay}>
          <sphereGeometry args={[1.03, 48, 24, MID + W, PI * 2 - 2 * W, HAIR_END, 0.65]} />
          <Mat color={HAIR} />
        </mesh>
      </group>

      <mesh position={[0, -1.45, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 1.0, 24]} />
        <Mat color={BASE} />
      </mesh>
    </group>
  );
}

/* --------------------------------- SCENE --------------------------------- */
// The model turns all the time. It pauses ONLY while the cursor is on a clickable area
// (or while the problem dialog is open) and starts turning again as soon as the cursor leaves.
export default function Scene3D({ mode, hovered, selected, onHover, onSelect, paused = false }) {
  const isSkin = mode === 'skin';

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  const regionProps = { hovered, selected, onHover, onSelect };

  return (
    <Canvas
      key={mode}
      dpr={[1, 2]}
      camera={isSkin ? { position: [0, 3.4, 9.5], fov: 34 } : { position: [0, 0.3, 4.8], fov: 35 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 6]} intensity={1.3} />
      <directionalLight position={[-5, 3, -4]} intensity={0.55} color="#75dad7" />
      {isSkin ? (
        <Body {...regionProps} />
      ) : mode === 'face' ? (
        <FaceHead {...regionProps} />
      ) : (
        <Head {...regionProps} />
      )}
      <OrbitControls
        enablePan={false}
        target={isSkin ? [0, 3.0, 0] : [0, -0.1, 0]}
        minDistance={isSkin ? 5 : 2.5}
        maxDistance={isSkin ? 14 : 8}
        enableDamping={false}
        autoRotate={!hovered && !paused}
        autoRotateSpeed={2.2}
      />
    </Canvas>
  );
}
