"use client";
import React, { useState } from 'react';
import PageHeader from '../../../../src/components/partner/PageHeader';
import { ArrowLeft, ArrowRight, Check, Home, Anchor, Building2, MapPin, Users, ImageIcon, DollarSign, Calendar, FileText, LucideIcon } from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type ListingType = 'yacht' | 'home' | 'hotel' | null;

interface StepInfo {
  number: Step;
  label: string;
  icon: LucideIcon;
}

const steps: StepInfo[] = [
  { number: 1, label: 'Type', icon: Home },
  { number: 2, label: 'Basics', icon: FileText },
  { number: 3, label: 'Location', icon: MapPin },
  { number: 4, label: 'Capacity', icon: Users },
  { number: 5, label: 'Photos', icon: ImageIcon },
  { number: 6, label: 'Pricing', icon: DollarSign },
  { number: 7, label: 'Availability', icon: Calendar },
  { number: 8, label: 'Review', icon: Check },
];

export default function NewListingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [listingType, setListingType] = useState<ListingType>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    capacity: 1,
    bedrooms: 1,
    bathrooms: 1,
    price: 100,
    currency: 'EUR'
  });

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handlePublish = () => {
    if (typeof window !== 'undefined') {
      window.showToast('Listing published successfully! 🎉', 'success');
    }
    setTimeout(() => {
      window.location.href = '/partner/listings';
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Create New Listing"
        subtitle={`Step ${currentStep} of ${steps.length}`}
        backHref="/partner/listings"
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Listings', href: '/partner/listings' },
          { label: 'New' }
        ]}
      />

      {/* Progress Steps */}
      <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;
            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-emerald-600 text-white' :
                    isActive ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What type of listing is this?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'yacht' as ListingType, icon: Anchor, label: 'Yacht / Boat', desc: 'Charter or rental vessels' },
                { id: 'home' as ListingType, icon: Home, label: 'Home / Villa', desc: 'Vacation rentals' },
                { id: 'hotel' as ListingType, icon: Building2, label: 'Hotel / Resort', desc: 'Hotel rooms or suites' }
              ].map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setListingType(type.id)}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                      listingType === type.id
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TypeIcon className={`w-12 h-12 mx-auto mb-3 ${listingType === type.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tell us about your listing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Luxury Yacht Mediterranean Explorer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Describe your property, its features, and what makes it special..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Where is your listing located?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address or Region</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Monaco, French Riviera"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 Tip: You can be as specific or general as you want. Exact addresses will only be shown to confirmed guests.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What can guests expect?</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Guests</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add photos of your listing</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Upload photos</h3>
              <p className="text-gray-600 mb-6">Drag and drop or click to browse</p>
              <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                Choose Files
              </button>
              <p className="text-xs text-gray-500 mt-4">Photo upload functionality coming soon</p>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Set your pricing</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (per night)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-900">
                  ✨ Guests will see: <span className="font-semibold">{formData.currency} {formData.price}</span> per night
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Set your availability</h2>
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Calendar Integration</h3>
              <p className="text-gray-600 mb-4">
                Advanced calendar functionality coming soon. For now, your listing will be available by default.
              </p>
              <p className="text-sm text-gray-500">You can manage availability from the Calendar page after publishing</p>
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review & Publish</h2>
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Listing Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium text-gray-900">{listingType || 'Not selected'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <span className="ml-2 font-medium text-gray-900">{formData.title || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium text-gray-900">{formData.location || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Capacity:</span>
                    <span className="ml-2 font-medium text-gray-900">{formData.capacity} guests</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="ml-2 font-medium text-gray-900">{formData.bedrooms}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="ml-2 font-medium text-gray-900">{formData.bathrooms}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium text-gray-900">{formData.currency} {formData.price}/night</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  🎉 You&apos;re all set! Review your listing details and publish when ready.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {currentStep < 8 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handlePublish}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <Check className="w-5 h-5" />
            Publish Listing
          </button>
        )}
      </div>
    </div>
  );
}
