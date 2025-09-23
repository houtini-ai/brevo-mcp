/**
 * Brevo Analytics Service
 * Utility functions for calculating metrics and insights
 */

export class BrevoAnalyticsService {
  static calculatePercentageChange(current, previous) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous * 100).toFixed(2);
  }

  static calculateRates(stats) {
    const sent = stats.sent || 0;
    if (sent === 0) {
      return {
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
      };
    }

    return {
      openRate: ((stats.uniqueOpens || 0) / sent * 100).toFixed(2),
      clickRate: ((stats.uniqueClicks || 0) / sent * 100).toFixed(2),
      bounceRate: (((stats.hardBounces || 0) + (stats.softBounces || 0)) / sent * 100).toFixed(2),
      unsubscribeRate: ((stats.unsubscriptions || 0) / sent * 100).toFixed(2),
    };
  }

  static determineEngagementLevel(opens, clicks, total) {
    if (total === 0) {
      return 'No Activity';
    }
    const openRate = opens / total;
    const clickRate = clicks / total;

    if (clickRate > 0.1) {
      return 'Highly Engaged';
    }
    if (clickRate > 0.05) {
      return 'Engaged';
    }
    if (openRate > 0.2) {
      return 'Moderately Engaged';
    }
    if (openRate > 0) {
      return 'Low Engagement';
    }
    return 'Not Engaged';
  }

  static generateInsights(metrics) {
    const insights = [];

    // Email performance insights
    if (metrics.emails) {
      const { sent, delivered, openRate, clickRate } = metrics.emails;

      if (openRate > 25) {
        insights.push('Strong email open rates indicate good subject lines and sender reputation');
      } else if (openRate < 15) {
        insights.push('Low open rates suggest need for subject line optimization');
      }

      if (clickRate > 5) {
        insights.push('Excellent click-through rates show engaging content');
      } else if (clickRate < 2) {
        insights.push('Consider improving email content and CTAs for better engagement');
      }

      const deliveryRate = sent > 0 ? (delivered / sent * 100) : 0;
      if (deliveryRate < 95) {
        insights.push('Delivery rate below 95% - review list hygiene and sender reputation');
      }
    }

    // Contact insights
    if (metrics.contacts) {
      const { total, active, growthRate } = metrics.contacts;

      if (growthRate > 10) {
        insights.push('Strong list growth - maintain engagement to prevent churn');
      } else if (growthRate < 0) {
        insights.push('List shrinkage detected - review unsubscribe reasons and re-engagement strategies');
      }

      const activeRate = total > 0 ? (active / total * 100) : 0;
      if (activeRate < 50) {
        insights.push('Low active contact rate - consider re-engagement campaigns');
      }
    }

    // Campaign insights
    if (metrics.campaigns) {
      const { count, averagePerformance } = metrics.campaigns;

      if (count === 0) {
        insights.push('No campaigns found - start sending to engage your audience');
      } else if (averagePerformance?.clickRate < 2) {
        insights.push('Campaign performance below industry average - A/B test different approaches');
      }
    }

    return insights.length > 0 ? insights : ['Performance metrics within normal ranges'];
  }
}
