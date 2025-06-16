/**
 * Enhanced UI Showcase Page
 * Demonstrates all enhanced UI components and animations
 */

import React, { useState } from 'react'
import { Play, Heart, Star, Download, Settings, Zap, Sparkles, Palette } from 'lucide-react'
import { FeatureErrorBoundary } from '@/shared/components'
import { Card, CardContent } from '@/components/ui/Card'
import EnhancedButton, {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  FloatingActionButton,
  ButtonGroup
} from '@/shared/components/enhanced/EnhancedButton'
import EnhancedCard, {
  GlassCard,
  TiltCard,
  MagneticCard,
  GradientCard,
  AnimatedContentCard,
  CardGrid,
  ExpandableCard,
  FlipCard
} from '@/shared/components/enhanced/EnhancedCard'
import {
  AnimatedElement,
  StaggeredAnimation,
  ParallaxElement,
  MorphingButton,
  Skeleton,
  ProgressBar,
  Toast
} from '@/shared/components/animations/AnimationSystem'

const UIShowcase: React.FC = () => {
  const [showToast, setShowToast] = useState(false)
  const [progress, setProgress] = useState(65)

  const handleProgressChange = () => {
    setProgress(Math.random() * 100)
  }

  const sampleCards = [
    { title: 'Enhanced Animations', description: 'Smooth micro-interactions and transitions' },
    { title: 'Performance Optimized', description: 'Hardware-accelerated animations' },
    { title: 'Responsive Design', description: 'Perfect on all devices and screen sizes' },
    { title: 'Accessibility First', description: 'Built with accessibility in mind' },
    { title: 'Modern UI/UX', description: 'Contemporary design patterns' },
    { title: 'Interactive Elements', description: 'Engaging user interactions' }
  ]

  return (
    <FeatureErrorBoundary featureName="UI Showcase">
      <div className="container mx-auto p-6 space-y-12">
        {/* Header */}
        <AnimatedElement animation="fadeInDown" duration="slow">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Enhanced UI/UX Showcase
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Experience the enhanced components and animations
            </p>
            <div className="flex justify-center">
              <Palette className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </AnimatedElement>

        {/* Enhanced Buttons Section */}
        <section className="space-y-6">
          <AnimatedElement animation="fadeInLeft" trigger="scroll">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Enhanced Buttons
            </h2>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Interactive Buttons</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <PrimaryButton icon={<Play className="w-4 h-4" />} soundEffect>
                    Play Game
                  </PrimaryButton>
                  <SecondaryButton icon={<Heart className="w-4 h-4" />} hapticFeedback>
                    Favorite
                  </SecondaryButton>
                  <OutlineButton icon={<Star className="w-4 h-4" />}>
                    Rate
                  </OutlineButton>
                </div>

                <div className="flex flex-wrap gap-3">
                  <EnhancedButton variant="success" bounce icon={<Download className="w-4 h-4" />}>
                    Download
                  </EnhancedButton>
                  <EnhancedButton variant="danger" pulse>
                    Delete
                  </EnhancedButton>
                  <GhostButton icon={<Settings className="w-4 h-4" />}>
                    Settings
                  </GhostButton>
                </div>

                <ButtonGroup staggerDelay={150}>
                  <EnhancedButton variant="outline" size="sm">Small</EnhancedButton>
                  <EnhancedButton variant="outline" size="md">Medium</EnhancedButton>
                  <EnhancedButton variant="outline" size="lg">Large</EnhancedButton>
                </ButtonGroup>
              </div>
            </GlassCard>

            <TiltCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Morphing & Loading</h3>
              <div className="space-y-4">
                <MorphingButton
                  morphTo={<span className="flex items-center"><Zap className="w-4 h-4 mr-2" />Activated!</span>}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  <span className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Hover to Morph
                  </span>
                </MorphingButton>

                <EnhancedButton loading variant="primary">
                  Loading Button
                </EnhancedButton>

                <EnhancedButton
                  variant="primary"
                  gradient
                  glow
                  onClick={() => setShowToast(true)}
                >
                  Show Toast
                </EnhancedButton>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* Enhanced Cards Section */}
        <section className="space-y-6">
          <AnimatedElement animation="fadeInRight" trigger="scroll">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Enhanced Cards
            </h2>
          </AnimatedElement>

          <CardGrid columns={3} staggerDelay={200}>
            {sampleCards.map((card, index) => (
              <AnimatedContentCard
                key={index}
                title={card.title}
                description={card.description}
                onClick={() => console.log(`Clicked ${card.title}`)}
              />
            ))}
          </CardGrid>
        </section>

        {/* Special Effects Section */}
        <section className="space-y-6">
          <AnimatedElement animation="fadeInUp" trigger="scroll">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Special Effects
            </h2>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MagneticCard className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Magnetic Effect</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Move your mouse around this card
              </p>
            </MagneticCard>

            <GradientCard className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Gradient Border</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Beautiful gradient borders
              </p>
            </GradientCard>

            <FlipCard
              front={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Front Side</h3>
                    <p className="text-gray-600">Click to flip</p>
                  </div>
                </div>
              }
              back={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Back Side</h3>
                    <p className="text-gray-600">Click to flip back</p>
                  </div>
                </div>
              }
            />
          </div>
        </section>

        {/* Animations Section */}
        <section className="space-y-6">
          <AnimatedElement animation="scaleIn" trigger="scroll">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Animation Examples
            </h2>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Staggered Animations</h3>
                <StaggeredAnimation animation="fadeInUp" staggerDelay={150}>
                  {['First Item', 'Second Item', 'Third Item', 'Fourth Item'].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                      {item}
                    </div>
                  ))}
                </StaggeredAnimation>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Progress & Loading</h3>
                <div className="space-y-4">
                  <ProgressBar
                    value={progress}
                    showLabel
                    animated
                    color="blue"
                  />
                  <EnhancedButton onClick={handleProgressChange} variant="outline" size="sm">
                    Update Progress
                  </EnhancedButton>

                  <div className="space-y-2">
                    <h4 className="font-medium">Loading Skeletons</h4>
                    <Skeleton height="1rem" />
                    <Skeleton height="1rem" width="80%" />
                    <Skeleton height="1rem" width="60%" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Expandable Content */}
        <section className="space-y-6">
          <AnimatedElement animation="rotateIn" trigger="scroll">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Interactive Content
            </h2>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ExpandableCard
              title="Expandable Card"
              preview="Click to see more content..."
              content={
                <div className="space-y-3">
                  <p>This is the expanded content that shows when you click the card.</p>
                  <p>It can contain any React components, images, or complex layouts.</p>
                  <div className="flex space-x-2">
                    <EnhancedButton size="sm" variant="primary">Action 1</EnhancedButton>
                    <EnhancedButton size="sm" variant="outline">Action 2</EnhancedButton>
                  </div>
                </div>
              }
            />

            <ParallaxElement speed={0.3}>
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Parallax Effect</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This card moves with a parallax effect as you scroll.
                  The movement creates depth and visual interest.
                </p>
              </GlassCard>
            </ParallaxElement>
          </div>
        </section>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setShowToast(true)}>
          <Zap className="w-6 h-6" />
        </FloatingActionButton>

        {/* Toast Notification */}
        {showToast && (
          <Toast
            message="Enhanced UI components are awesome!"
            type="success"
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </FeatureErrorBoundary>
  )
}

export default UIShowcase
