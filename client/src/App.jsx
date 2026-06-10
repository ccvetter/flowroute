import { useEffect, useState } from 'react';
import { StatusBadge, CountBadge } from './components/shared/StatusBadge';
import { ActionButton, ActionButtonGroup } from './components/shared/ActionButton';
import ChevronRightIcon, { ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon } from './components/icons/ChevronIcon';
import PackageIcon from './components/icons/PackageIcon';
import MonoID from './components/shared/MonoID';

export default function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/message')
      .then(res => res.json())
      .then(data => setData(data.message));
  }, []);

  return (
    <div>
      <h1>{data}</h1>

      <table>
        <thead><th>Variants</th></thead>
        <tr>
          <td><StatusBadge status="pending" /></td>
          <td><StatusBadge status="allocated" /></td>
          <td><StatusBadge status="picking" /></td>
          <td><StatusBadge status="packing" /></td>
          <td><StatusBadge status="shipped" /></td>
          <td><StatusBadge status="delivered" /></td>
          <td><StatusBadge status="exception" /></td>
          <td><StatusBadge status="cancelled" /></td>
        </tr>
      </table>
      
      <table>
        <thead><th>Stock statuses</th></thead>
        <tr>
          <td><StatusBadge status="in-stock" variant="stock" /></td>
          <td><StatusBadge status="low-stock" variant="stock" /></td>
          <td><StatusBadge status="out-of-stock" variant="stock" /></td>
        </tr>
      </table>

      <table>
        <thead><th>Priority</th></thead>
        <tr>
          <td><StatusBadge status="high" variant="priority" /></td>
          <td><StatusBadge status="medium" variant="priority" /></td>
          <td><StatusBadge status="low" variant="priority" /><br /></td>
        </tr>
      </table>
      
      <table>
        <thead><th>Sizes</th></thead>
        <tr>
          <td><StatusBadge status="shipped" size="sm" /></td>
          <td><StatusBadge status="shipped" size="md" /></td>
          <td><StatusBadge status="shipped" size="lg" /></td>
        </tr>
      </table>
      
      <table>
        <thead><th>Icon modes</th></thead>
        <tr>
          <td><StatusBadge status="picking" iconMode="icon" /></td>
          <td><StatusBadge status="picking" iconMode="dot" /></td>
          <td><StatusBadge status="picking" iconMode="none" /></td>
        </tr>
      </table>
      
      <table>
        <thead><th>Custom label</th></thead>
        <tr>
          <td><StatusBadge status="exception" label="Carrier delay" /></td>
        </tr>
      </table>
      
      <table>
        <thead><tr>Disable pulse</tr></thead>
        <tr>
          <td><StatusBadge status="picking" pulse={false} /></td>
        </tr>
      </table>
      
      <table>
        <thead><th>Count badge</th></thead>
        <tr>
          <td><CountBadge count={3} /></td>
          <td><CountBadge count={120} max={99} /></td>
          <td><CountBadge count={0} hideWhenZero /></td>
        </tr>
      </table>

      <table>
        <thead><th>MonoID Variants</th></thead>
        <tr>
          <td><MonoID id="#FR-48291" variant="order" /></td>
          <td><MonoID id="SKU-00412" variant="sku" /></td>
          <td><MonoID id="SHP-UPS-9923A" variant="shipment" /></td>
          <td><MonoID id="TRK-UPS-41882" variant="carrier" /></td>
          <td><MonoID id="A-12-C" variant="bin" /></td>
          <td><MonoID id="abc-123" variant="generic" /></td>
        </tr>
      </table>

      <table>
        <thead><th>MonoID Sizes</th></thead>
        <tr>
          <td><MonoID id="#FR-48291" size="xs" /></td>
          <td><MonoID id="#FR-48291" size="sm" /></td>
          <td><MonoID id="#FR-48291" size="md" /></td>
          <td><MonoID id="#FR-48291" size="lg" /></td>
        </tr>
      </table>

      <table>
        <thead><th>MonoID copyable</th></thead>
        <tr>
          <td><MonoID id="#FR-48291" copyable={false} /></td>
        </tr>
      </table>

      <table>
        <thead><th>ActionButton intents</th></thead>
        <tr>
          <td><ActionButton intent="primary">Assign pick</ActionButton></td>
          <td><ActionButton intent="secondary">View order</ActionButton></td>
          <td><ActionButton intent="ghost">Cancel</ActionButton></td>
          <td><ActionButton intent="danger">Flag exception</ActionButton></td>
          <td><ActionButton intent="danger-fill">Delete order</ActionButton></td>
        </tr>
      </table>

      <table>
        <thead><th>Buttons with icons</th></thead>
        <tr>
          <td>
            <ActionButton intent="primary" icon={<PackageIcon />}>
              Assign pick
            </ActionButton>
          </td>
          <td>
            <ActionButton intent="secondary" icon={<ChevronRightIcon />} iconPosition="right">
              View order
            </ActionButton>
          </td>
        </tr>
      </table>

      <table>
        <thead><th>Chevron icon variants</th></thead>
        <tr>
          <td><ChevronRightIcon direction="right" /></td>
          <td><ChevronRightIcon direction="left" /></td>
          <td><ChevronRightIcon direction="up" /></td>
          <td><ChevronRightIcon direction="down" /></td>
        </tr>
      </table>

      <table>
        <thead><th>Named convenience icons</th></thead>
        <tr>
          <td><ChevronRightIcon /></td>
          <td><ChevronLeftIcon /></td>
          <td><ChevronUpIcon /></td>
          <td><ChevronDownIcon /></td>
        </tr>
      </table>

      <table>
        <thead><th>Chevron icon sizes</th></thead>
        <tr>
          <td><ChevronRightIcon size="xs" /></td>
          <td><ChevronRightIcon size="sm" /></td>
          <td><ChevronRightIcon size="md" /></td>
          <td><ChevronRightIcon size="lg" /></td>
          <td><ChevronRightIcon size="xl" /></td>
        </tr>
      </table>
    </div>
  );
}