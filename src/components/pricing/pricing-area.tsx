'use client'

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SUBSCRIPTION_PLANS, formatPrice, getYearlySavingsPercentage, type SubscriptionTier } from "@/lib/subscription";
import icon from "@/assets/images/assets/ils_04.svg";

// Pricing card item
type PricingCardProps = {
  planId: SubscriptionTier;
  isYearly: boolean;
  isPopular?: boolean;
  isSpecial?: boolean;
};

function PricingCard({ planId, isYearly, isPopular, isSpecial }: PricingCardProps) {
  const plan = SUBSCRIPTION_PLANS[planId];
  const price = isYearly 
    ? (planId === 'premium_toolkit' && plan.firstYearPrice ? plan.firstYearPrice : plan.yearlyPrice)
    : plan.monthlyPrice;
  
  const displayPrice = isYearly && planId === 'premium_toolkit' && plan.firstYearPrice
    ? plan.firstYearPrice
    : price;

  return (
    <div className={`pricing-card-one d-flex flex-column w-100 h-100 text-center position-relative ${
      isPopular ? 'popular-plan' : ''
    } ${isSpecial ? 'special-plan' : ''}`}>
      {isPopular && (
        <span className="badge bg-color-one text-dark position-absolute top-0 start-50 translate-middle-x px-4 py-2 rounded-pill">
          Most Popular
        </span>
      )}
      {isSpecial && (
        <span className="badge bg-color-four text-dark position-absolute top-0 start-50 translate-middle-x px-4 py-2 rounded-pill">
          Best Value
        </span>
      )}
      
      <h2 className="fw-bold mt-4">{plan.name}</h2>
      <div className="row">
        <div className="col-xxl-9 m-auto">
          <p className="text-muted">{plan.description}</p>
        </div>
      </div>
      
      <div className="price-banner text-lg-start d-lg-flex justify-content-center align-items-center">
        <div className="price">
          <sup>CA$</sup> {displayPrice.toFixed(2)}
        </div>
        <div className="ps-lg-4">
          <strong className="text-lg fw-500">
            {isYearly ? 'Yearly' : 'Monthly'} membership
          </strong>
          {isYearly && plan.monthlyPrice > 0 && (
            <span className="d-block text-muted small">
              {formatPrice(plan.monthlyPrice)}/month billed yearly
            </span>
          )}
          {isYearly && planId === 'premium_toolkit' && plan.firstYearPrice && (
            <span className="d-block text-warning small">
              First year: {formatPrice(plan.firstYearPrice)}, then {formatPrice(plan.yearlyPrice)}/year
            </span>
          )}
        </div>
      </div>

      <ul className="style-none mb-35 text-start">
        {plan.features.map((feature, i) => (
          <li key={i} className="d-flex align-items-start">
            <i className="bi bi-check-circle-fill text-color-one me-2 mt-1"></i>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className="action-btn text-center mt-auto">
        <Link 
          href={`/checkout?plan=${planId}&cycle=${isYearly ? 'yearly' : 'monthly'}`}
          className="btn-one w-100"
        >
          Get {plan.name} <i className="bi bi-chevron-right"></i>
        </Link>
        <p className="text-muted small mt-2 mb-0">
          Cancel anytime • 14 days money back guarantee
        </p>
      </div>
    </div>
  );
}

const PricingArea = () => {
  const [isYearly, setIsYearly] = useState(true);

  const plans: SubscriptionTier[] = ['basic', 'premium', 'premium_toolkit'];

  return (
    <div className="pricing-section light-bg border-top pt-120 lg-pt-80 pb-150 lg-pb-80">
      <div className="container">
        {/* Header */}
        <div className="row align-items-center mb-60">
          <div className="col-lg-7 text-center text-lg-start">
            <div className="title-one">
              <h2>Choose Your Plan</h2>
            </div>
            <p className="text-lg pt-10 m0">
              Original chords. Top notch quality. We combine artificial intelligence (AI) with music researchers (humans) to calculate original chords from audio signals. Advanced deep neural networks serve original chords of top quality in just a few seconds. That's the magic of our ever improving algorithm.
            </p>
          </div>
          <div className="col-lg-5">
            <nav className="pricing-nav d-flex justify-content-center justify-content-lg-end md-mt-40">
              <div className="nav nav-tabs" id="nav-tab" role="tablist">
                <button
                  className={`nav-link ${!isYearly ? 'active' : ''}`}
                  onClick={() => setIsYearly(false)}
                  type="button"
                >
                  Monthly
                </button>
                <button
                  className={`nav-link ${isYearly ? 'active' : ''}`}
                  onClick={() => setIsYearly(true)}
                  type="button"
                >
                  Yearly
                  {isYearly && (
                    <span className="badge bg-color-one text-dark ms-2">
                      Save up to {getYearlySavingsPercentage('premium')}%
                    </span>
                  )}
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="row gx-xl-5">
          {plans.map((planId, index) => (
            <div key={planId} className="col-md-6 col-lg-4 mb-65 md-mb-30">
              <PricingCard
                planId={planId}
                isYearly={isYearly}
                isPopular={planId === 'premium'}
                isSpecial={planId === 'premium_toolkit'}
              />
            </div>
          ))}
        </div>

        {/* Free Plan Info */}
        <div className="row mt-80">
          <div className="col-lg-8 m-auto">
            <div className="pricing-card-one d-flex flex-column w-100 h-100 text-center">
              <h2 className="fw-bold">Free Plan</h2>
              <p className="text-muted">
                Get started with basic features - no credit card required
              </p>
              <ul className="style-none mb-35 text-start">
                {SUBSCRIPTION_PLANS.free.features.map((feature, i) => (
                  <li key={i} className="d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-color-one me-2 mt-1"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="action-btn text-center mt-auto">
                <Link href="/register" className="btn-six w-100">
                  Get Started Free <i className="bi bi-chevron-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Banner */}
        <div className="contact-banner position-relative mt-100">
          <Image src={icon} alt="icon" className="lazy-img shapes screen_01" />
          <div className="row align-items-center justify-content-end">
            <div className="col-lg-6">
              <h2>
                Want a <span>custom pricing</span> plan for your school or students?
              </h2>
              <p className="text-muted">
                If you're a teacher at a college, school or university, or you're an independent music teacher looking to purchase multiple Premium subscriptions, we can arrange a discount for the subscriptions and provide a good deal to help your students have access to Premium on PhinAccords.
              </p>
            </div>
            <div className="col-lg-4 text-center text-lg-end">
              <Link href="/contact" className="btn-four">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="row mt-100">
          <div className="col-lg-10 m-auto">
            <div className="title-one text-center mb-60">
              <h2>Frequently Asked Questions</h2>
            </div>
            <div className="accordion" id="pricingFAQ">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                    How does PhinAccords work exactly?
                  </button>
                </h2>
                <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#pricingFAQ">
                  <div className="accordion-body">
                    PhinAccords is your #1 platform for chords. We help musicians of all levels to learn and play the music they love. Simple. Fast. Accurate. PhinAccords gives you the chords for any song and aligns them to the music in a simple to use player.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                    Can I use PhinAccords on any device?
                  </button>
                </h2>
                <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                  <div className="accordion-body">
                    Yes, that's right. Phone, tablet, laptop, desktop, etc. Just make sure to log in with the same email address.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                    Can I cancel my subscription at any time?
                  </button>
                </h2>
                <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                  <div className="accordion-body">
                    Sure! You can cancel at any moment and you'll still be able to use all of the PhinAccords Premium features for the duration of your subscription. After cancellation, you can still use PhinAccords the non-Premium way.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                    Can I get my money back if I change my mind?
                  </button>
                </h2>
                <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                  <div className="accordion-body">
                    For subscriptions, we have a 14 day money back guarantee. If you're dissatisfied in any way or your subscription isn't what you expected, just contact us within 14 days and we'll give you a refund.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingArea;
