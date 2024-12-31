"use client";

import React from "react";
import StatCards from "./StatCards";
import BoatsOverview from "./BoatsOverview";
import ShipmentStatistics from "./ShipmentStatistics";
import DeliveryPerformance from "./DeliveryPerformance";
import DeliveryExceptions from "./DeliveryExceptions";
import OrdersByOutlets from "./OrdersByOutlets";

const Monitor = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Stats Cards */}
        <StatCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BoatsOverview />
          <ShipmentStatistics />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DeliveryPerformance />
          <DeliveryExceptions />
          <OrdersByOutlets />
        </div>
      </div>
    </div>
  );
};

export default Monitor;
