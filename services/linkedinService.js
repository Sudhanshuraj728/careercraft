const logger = require('../utils/logger');

/**
 * LinkedIn People Search Service
 * Note: LinkedIn's official API has limited people search capabilities.
 * This implementation uses available endpoints and provides fallback options.
 */

class LinkedInService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.linkedin.com/v2';
  }

  /**
   * Search for people working at a company
   * Note: LinkedIn's People Search API requires special partnership access.
   * This method provides the structure for when access is granted.
   */
  async searchCompanyEmployees(companyName, limit = 10) {
    try {
      // Method 1: Try to find company first
      const company = await this.searchCompany(companyName);
      
      if (!company) {
        logger.warn(`Company not found on LinkedIn: ${companyName}`);
        const suggestions = await this.generateNetworkingSuggestions(companyName);
        return {
          success: false,
          message: 'Company not found on LinkedIn',
          profiles: [],
          suggestions: suggestions
        };
      }

      // Method 2: Get company page followers (limited access)
      // This requires specific API permissions
      const profiles = await this.getCompanyFollowers(company.id, limit);
      const suggestions = await this.generateNetworkingSuggestions(companyName);
      
      return {
        success: true,
        company: {
          name: company.name,
          id: company.id,
          url: `https://www.linkedin.com/company/${company.vanityName || company.id}`,
          industry: company.industry
        },
        profiles: profiles,
        count: profiles.length,
        suggestions: suggestions
      };
      
    } catch (error) {
      logger.error('LinkedIn search error:', error);
      
      // Return helpful suggestions even if API fails
      const suggestions = await this.generateNetworkingSuggestions(companyName);
      return {
        success: false,
        message: 'LinkedIn search temporarily unavailable',
        profiles: [],
        suggestions: suggestions
      };
    }
  }

  /**
   * Search for a company on LinkedIn
   */
  async searchCompany(companyName) {
    try {
      const response = await fetch(
        `${this.baseUrl}/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${companyName}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        logger.warn(`Company search failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.elements?.[0] || null;
      
    } catch (error) {
      logger.error('Company search error:', error);
      return null;
    }
  }

  /**
   * Get company followers (limited by LinkedIn API permissions)
   */
  async getCompanyFollowers(companyId, limit = 10) {
    try {
      // This endpoint requires special permissions
      // Placeholder for when access is granted
      const response = await fetch(
        `${this.baseUrl}/organizationFollowers?q=organization&organization=${companyId}&count=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return this.formatProfiles(data.elements || []);
      
    } catch (error) {
      logger.error('Get followers error:', error);
      return [];
    }
  }

  /**
   * Format profile data for frontend
   */
  formatProfiles(profiles) {
    return profiles.map(profile => ({
      name: `${profile.firstName} ${profile.lastName}`,
      headline: profile.headline || '',
      profileUrl: `https://www.linkedin.com/in/${profile.vanityName || profile.id}`,
      pictureUrl: profile.pictureUrl || '',
      currentPosition: profile.positions?.values?.[0]?.title || '',
      connectionDegree: profile.distance?.value || 'unknown'
    }));
  }

  /**
   * Generate networking suggestions when API access is limited
   */
  async generateNetworkingSuggestions(companyName) {
    try {
      // Try to get user's connections at the company
      const connections = await this.getConnectionsAtCompany(companyName);
      const education = await this.getMyEducation();
      
      const tips = [];
      
      // Add personalized tip if user has connections
      if (connections && connections.length > 0) {
        tips.push({
          icon: '👥',
          title: 'Your Network at ' + companyName,
          description: `You have ${connections.length} connection${connections.length > 1 ? 's' : ''} at ${companyName}! Reach out to them for referrals and insights.`,
          action: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName)}&network=%5B%22F%22%5D`,
          personalized: true
        });
      }
      
      // Add alumni tip with user's schools
      if (education && education.length > 0) {
        const schoolNames = education.map(e => e.schoolName).join(', ');
        tips.push({
          icon: '🎓',
          title: 'Alumni Network',
          description: `Find alumni from ${schoolNames} working at ${companyName}`,
          action: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName)}&network=%5B%22S%22%5D`,
          personalized: true
        });
      }
      
      // Add standard tips
      tips.push(
        {
          icon: '🔍',
          title: 'LinkedIn Search',
          description: `Search "${companyName}" on LinkedIn and filter by "People" to find current employees`,
          action: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName)}&origin=GLOBAL_SEARCH_HEADER`
        },
        {
          icon: '🏢',
          title: 'Company Page',
          description: `Visit ${companyName}'s LinkedIn page and browse their employees section`,
          action: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}/people/`
        },
        {
          icon: '📧',
          title: 'Recruiter Outreach',
          description: 'Search for recruiters and talent acquisition specialists at the company',
          action: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName + ' recruiter')}`
        }
      );
      
      return {
        message: connections && connections.length > 0 
          ? `Great news! You have ${connections.length} connection${connections.length > 1 ? 's' : ''} at ${companyName}` 
          : 'Connect with employees at ' + companyName,
        tips: tips
      };
    } catch (error) {
      logger.error('Error generating networking suggestions:', error);
      // Return basic suggestions if personalization fails
      return {
        message: 'Connect with employees at ' + companyName,
        tips: [
          {
            icon: '🔍',
            title: 'LinkedIn Search',
            description: `Search "${companyName}" on LinkedIn and filter by "People" to find current employees`,
            action: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName)}&origin=GLOBAL_SEARCH_HEADER`
          },
          {
            icon: '🏢',
            title: 'Company Page',
            description: `Visit ${companyName}'s LinkedIn page and browse their employees section`,
            action: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}/people/`
          },
          {
            icon: '💼',
            title: 'Alumni Network',
            description: 'Look for alumni from your school working at the company',
            action: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName)}&network=%5B%22S%22%5D`
          },
          {
            icon: '📧',
            title: 'Recruiter Outreach',
            description: 'Search for recruiters and talent acquisition specialists at the company',
            action: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName + ' recruiter')}`
          }
        ]
      };
    }
  }

  /**
   * Get user's connections at a specific company
   */
  async getConnectionsAtCompany(companyName) {
    try {
      const response = await fetch(`${this.baseUrl}/connections?q=viewer&projection=(elements*(to~))`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        logger.warn('Could not fetch connections');
        return [];
      }

      const data = await response.json();
      // Filter connections by company name
      const connections = data.elements || [];
      const companyConnections = connections.filter(conn => {
        const person = conn['to~'];
        return person && person.positions && person.positions.values &&
          person.positions.values.some(pos => 
            pos.company && pos.company.name && 
            pos.company.name.toLowerCase().includes(companyName.toLowerCase())
          );
      });

      return companyConnections;
    } catch (error) {
      logger.warn('Error fetching connections:', error);
      return [];
    }
  }

  /**
   * Get user's education history
   */
  async getMyEducation() {
    try {
      const response = await fetch(`${this.baseUrl}/me?projection=(id,firstName,lastName,educations*)`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        logger.warn('Could not fetch education');
        return [];
      }

      const data = await response.json();
      return data.educations?.elements || [];
    } catch (error) {
      logger.warn('Error fetching education:', error);
      return [];
    }
  }

  /**
   * Get user's own LinkedIn profile
   */
  async getMyProfile() {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }
}

module.exports = LinkedInService;
